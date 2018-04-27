(function() {
    'use strict';
    
    angular.module('builder').factory('aivaTemplate', aivaTemplate);
    
    aivaTemplate.$inject = ['localStorage', 'templateResource', '$http', '$q'];
    
    function aivaTemplate(localStorage, templateResource, $http, $q) {
        
        var service = {
            assignTemplate: assignTemplate,
            getAllTemplates: getAllTemplates,
            getProjectTemplateId: getProjectTemplateId,
            getTemplateData: getTemplateData
        };
        
        return service;
        
        function assignTemplate(projectName, templateId) {
            localStorage.set(projectName, templateId);
        }
        
        function getAllTemplates() {
            return templateResource.query();
        }
        
        function getProjectTemplateId(projectName) {
            return localStorage.get(projectName);
        }
        
        function getTemplateData(template) {
            var html = $http.get(template.html);
            var css = $http.get(template.css);
            var overlayJson = template.overlayJson;
            var mobileOverlayJson = template.mobileOverlayJson;
            
            return $q.all([html, css, overlayJson, mobileOverlayJson]);
        }
    }
    
}());