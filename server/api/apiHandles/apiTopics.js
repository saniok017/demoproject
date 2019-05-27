const express = require('express');
const { ObjectId } = require('mongoose').Types;
const ClassDBController = require('../../database/dbController');
const adminAuth = require('../../middleware/adminAuth');
const objectIdValidation = require('../../middleware/objectIdValidation');

const router = express.Router();

router
  .route('/')
  .get((req, res) => {
    const DBController = new ClassDBController('topic');

    DBController.findTopics(req)
      .then(async topics => {
        const pagination = {};

        if (req.pagination.limit > 0) {
          const total = (await DBController.findTopics({})).length;
          const totalPages = Math.ceil(total / req.pagination.limit);

          pagination.pages = {
            total: totalPages
          };
        }

        return res.status(200).json({ data: topics, ...pagination });
      })
      .catch(error => res.status(404).send(error));
  })
  .post(adminAuth, (req, res) => {
    const DBController = new ClassDBController('topic');

    DBController.postNewTopic(req.body)
      .then(newTopic => {
        res.status(200).json({ data: newTopic });
      })
      .catch(error => res.status(404).send(error));
  });

router
  .route('/:id')
  .get(objectIdValidation, (req, res) => {
    const DBController = new ClassDBController('topic');
    req.query = {
      ...req.query,
      _id: req.params.id
    };

    DBController.findTopics(req)
      .then(topic => {
        return res.status(200).json({ data: topic });
      })
      .catch(error => res.status(404).send(error));
  })
  .put(adminAuth, objectIdValidation, (req, res) => {
    const DBController = new ClassDBController('topic');

    DBController.updateTopic(req.params.id, req.body)
      .then(updatedTopic => {
        res.status(200).json({ data: updatedTopic });
      })
      .catch(error => res.status(404).send(error));
  });

router
  .route('/:topicId/:userId')
  .post((req, res) => {
    if (
      ObjectId.isValid(req.params.topicId) &&
      ObjectId.isValid(req.params.userId)
    ) {
      const DBController = new ClassDBController('subscription');

      DBController.createSubscription(req.params.topicId, req.params.userId)
        .then(subscription => {
          res.status(200).json({ data: subscription });
        })
        .catch(error => res.status(404).send(error));
    } else {
      res.status(404).send('TopicId & userId is not valid ObjectId!');
    }
  })
  .delete((req, res) => {
    if (
      ObjectId.isValid(req.params.topicId) &&
      ObjectId.isValid(req.params.userId)
    ) {
      const DBController = new ClassDBController('subscription');

      DBController.removeSubscription(req.params.topicId, req.params.userId)
        .then(removedSubscription => {
          res.status(200).json({ data: removedSubscription });
        })
        .catch(error => res.status(404).send(error));
    } else {
      res.status(404).send('TopicId & userId is not valid ObjectId!');
    }
  });

module.exports = router;
