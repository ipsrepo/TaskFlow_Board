const express = require('express');

const ProjectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router({mergeParams: true});

router.use(authController.protectRoute);


router
    .route('/')
    .get(ProjectController.getAllProjects)
    .post(
        authController.restrictTo('lead', 'admin'),
        ProjectController.createProject,
    );

router
    .route('/:id')
    .get(ProjectController.getProject)
    .put(
        authController.restrictTo('lead', 'admin'),
        ProjectController.updateProject,
    )
    .delete(
        authController.restrictTo('lead', 'admin'),
        ProjectController.deleteProject,
    );

router.get('/:id/status-boards', ProjectController.getStatusBoards);


router.use(authController.restrictTo('lead', 'admin'));
router
    .post('/:id/members',
        ProjectController.addMember);
router
    .delete('/:id/members/:userId',
        ProjectController.removeMember);


router.post('/:id/status-boards', ProjectController.createStatusBoard);
router.put('/:id/status-boards/:boardName', ProjectController.updateStatusBoard);
router.delete('/:id/status-boards/:boardName', ProjectController.deleteStatusBoard);

module.exports = router;