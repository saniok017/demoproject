const mongoose = require('mongoose');
const UserSchema = require('../models/user');
const isString = require('../../utilities/isString');
const nullAndUndefinedValidation = require('./../../utilities/nullAndUndefinedValidation');
const cloneObject = require('./../../../test/dbController/lib/cloneObject');

function userMethodsFactory(userModelName) {
  if (!isString(userModelName)) {
    throw new TypeError('userModelName should be a String');
  }

  const Users = UserSchema(userModelName);

  const findUsers = req =>
    Users.find(req.query, req.fields || '-admin.password', {
      ...req.sorting,
      ...req.pagination
    });

  const findOneUser = (query, fields = null) =>
    Users.findOne(query, fields).exec();

  const countUsers = () => Users.find({}).count();

  const updateUser = (id, newProps) => {
    nullAndUndefinedValidation(id, newProps);
    return Users.findOneAndUpdate(
      { _id: id },
      { $set: newProps },
      {
        upsert: true,
        new: true,
        fields: '-admin.password'
      }
    );
  };

  const getAllUsers = (fields = null) => {
    return Users.find({}, fields).exec();
  };

  const getUserByUserId = id => {
    if (!isString(id)) {
      console.log('TypeError at getUserByUserId: id should be a string!');
    }
    return Users.findById(id).exec();
  };

  const getUserByTelegramId = (telegramId, fields = null) => {
    return Users.findOne({ telegramId }, fields).exec();
  };

  const createNewUser = user => {
    nullAndUndefinedValidation(user);
    const newUser = {
      firstName: user.first_name,
      lastName: user.last_name,
      telegramId: user.id,
      avatar: user.photo_url,
      username: user.username,
      events: [],
      created: Date.now(),
      banned: { status: false, expired: 0 },
      admin: { permission: 0, password: null }
    };
    return Users.findOneAndUpdate(
      { telegramId: newUser.telegramId },
      { $set: newUser },
      { upsert: true, new: true }
    );
  };

  const updateUserInfoByUserId = (_id, info) => {
    nullAndUndefinedValidation(_id, info);
    return Users.findOneAndUpdate(
      { _id },
      {
        $set: {
          firstName: info.first_name,
          lastName: info.last_name,
          avatar: info.photo_url,
          username: info.username
        }
      }
    );
  };

  const removeUserByUserId = _id => {
    nullAndUndefinedValidation(_id);
    return Users.deleteOne({ _id }).exec();
  };

  const getAllUsersByEventId = (id, fields = {}, sorting = {}) => {
    return Users.find({ 'events.eventId': id }, fields, sorting).exec();
  };

  const putUserEventByUserId = (_id, eventId) => {
    nullAndUndefinedValidation(_id, eventId);
    return Users.findOneAndUpdate(
      { _id },
      { $push: { events: { eventId } } },
      err => {
        if (err) console.log(err);
      }
    );
  };

  const getAllUserEventsByUserId = _id => {
    return Users.findOne({ _id }, { events: 1 }).exec();
  };

  const removeUserEventByUserId = (_id, eventId) => {
    return Users.findOneAndUpdate({ _id }, { $pull: { events: { eventId } } });
  };

  const removeAllUserEventsByUserId = _id => {
    return Users.updateOne({ _id }, { $set: { events: [] } });
  };

  const setUserDepartmentByUserId = (_id, department) => {
    nullAndUndefinedValidation(_id, department);
    return Users.updateOne({ _id }, { $set: { department } });
  };

  const getUserDepartmentByUserId = _id => {
    return Users.find({ _id }, 'department').exec();
  };

  const banUserByUserId = (_id, duration) => {
    nullAndUndefinedValidation(_id, duration);
    const expireTime = Date.now() + duration;
    console.log('expire time');
    return Users.findOneAndUpdate(
      { _id },
      { $set: { 'banned.status': true, 'banned.expired': expireTime } },
      { upsert: true }
    ).exec();
  };

  const unbanUserByUserId = _id => {
    return Users.findOneAndUpdate(
      { _id },
      { $set: { 'banned.status': false, 'banned.expired': 0 } },
      { upsert: true }
    ).exec();
  };

  const assignAdminByUserId = (_id, password) => {
    nullAndUndefinedValidation(_id, password);
    return Users.updateOne(
      { _id },
      { $set: { 'admin.permission': 1, 'admin.password': password } }
    );
  };

  const assignSuperAdminByUserId = (_id, password) => {
    nullAndUndefinedValidation(_id, password);
    return Users.updateOne(
      { _id },
      { $set: { 'admin.permission': 2, 'admin.password': password } }
    );
  };

  const getAdminPropertiesByUserId = _id => {
    return Users.findOne({ _id }, { admin: 1 }).exec();
  };

  const dischargeAdminByUserId = _id => {
    nullAndUndefinedValidation(_id);
    return Users.updateOne(
      { _id },
      { $set: { 'admin.permission': 0, 'admin.password': null } }
    );
  };

  return {
    getAllUsers,
    getAllUsersByEventId,
    findUsers,
    getUserByUserId,
    getUserByTelegramId,
    createNewUser,
    updateUserInfoByUserId,
    removeUserByUserId,
    putUserEventByUserId,
    getAllUserEventsByUserId,
    removeUserEventByUserId,
    removeAllUserEventsByUserId,
    setUserDepartmentByUserId,
    getUserDepartmentByUserId,
    banUserByUserId,
    unbanUserByUserId,
    assignAdminByUserId,
    dischargeAdminByUserId,
    findOneUser,
    updateUser,
    assignSuperAdminByUserId,
    getAdminPropertiesByUserId,
    countUsers
  };
}

module.exports = userMethodsFactory;
