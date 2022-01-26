const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares');
const ctrl = require('../../controllers/contacts');

router.get('/', authenticate, ctrl.getAll);

router.get('/:id', authenticate, ctrl.getById);

router.post('/', authenticate, ctrl.add);

router.put('/:id', ctrl.updateById);

router.patch('/:id/active', ctrl.updateActive);

router.delete('/:id', ctrl.removeById);

module.exports = router;
