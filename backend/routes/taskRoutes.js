const express = require('express');

const TaskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router({mergeParams: true});

router.use(authController.protectRoute);


router
    .route('/')
    .get(TaskController.getAllTasks)
    .post(
        authController.restrictTo('lead', 'admin'),
        TaskController.createTask,
    );

router
    .route('/:id')
    .get(TaskController.getTask)
    .patch(
        authController.restrictTo('lead', 'admin'),
        TaskController.updateTask,
    )
    .delete(
        authController.restrictTo('lead', 'admin'),
        TaskController.deleteTask,
    );

router.patch('/:id/status', TaskController.updateTaskStatus);
router.get('/my-tasks', TaskController.getMyTasks);

router.post('/:id/comments', TaskController.addComment);

router.get('/project/:projectId/kanban', TaskController.getKanbanTasks);
router.get('/project/:projectId', TaskController.getProjectTasks);

module.exports = router;