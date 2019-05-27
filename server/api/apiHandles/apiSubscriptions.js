const express = require('express');
const { ObjectId } = require('mongoose').Types;
const ClassDBController = require('../../database/dbController');
const adminAuth = require('../../middleware/adminAuth');
const objectIdValidation = require('../../middleware/objectIdValidation');

const router = express.Router();

router.route('/').get((req, res) => {
  const DBController = new ClassDBController('subscription');

  DBController.findSubscriptions(req)
    .then(async subscriptions => {
      const pagination = {};

      if (req.pagination.limit > 0) {
        const total = (await DBController.findDescriptions({})).length;
        const totalPages = Math.ceil(total / req.pagination.limit);

        pagination.pages = {
          total: totalPages
        };
      }

      return res.status(200).json({ data: subscriptions, ...pagination });
    })
    .catch(error => res.status(404).send(error));
});

router.route('/topic/:id').get(objectIdValidation, (req, res) => {
  const DBController = new ClassDBController('subscription');
  req.query = {
    ...req.query,
    topicId: req.params.id
  };

  DBController.findSubscriptions(req)
    .then(subscribedUsers => {
      const usersId = subscribedUsers.map(user => user.userId);
      return res.status(200).json({ data: usersId });
    })
    .catch(error => res.status(404).send(error));
});

module.exports = router;
