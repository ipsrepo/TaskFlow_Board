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
    .patch(
        authController.restrictTo('lead', 'admin'),
        ProjectController.updateProject,
    )
    .delete(
        authController.restrictTo('lead', 'admin'),
        ProjectController.deleteProject,
    );

module.exports = router;