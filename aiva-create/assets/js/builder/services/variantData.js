(function() {
    'use strict';

    angular.module('builder').factory('variantData', variantData);

    variantData.$inject = ['$rootScope'];

    function variantData($rootScope) {
        var service = {
            addSingleVariantDataToDom: addSingleVariantDataToDom,
            addMultipleVariantDataToDom: addMultipleVariantDataToDom,
            getDataArrayFromDom: getDataArrayFromDom,
            replaceDataAttribute: replaceDataAttribute,
            removeVariantDataFromDom: removeVariantDataFromDom,
        };

        return service;

        function addSingleVariantDataToDom(variantObj) {
            addId(variantObj.id, variantObj.mobile);
            addPercentage(variantObj.percentage, variantObj.mobile);
            addActive(variantObj.active, variantObj.mobile);
        }

        function addMultipleVariantDataToDom(variantObjs) {
            _.forEach(variantObjs, function(variantObj) {
                addId(variantObj.id, variantObj.mobile);
                addPercentage(variantObj.percentage, variantObj.mobile);
                addActive(variantObj.active, variantObj.mobile);
            });
        }

        function removeVariantDataFromDom(variantObj) {
            var idKey = 'data-vars-id-' + (variantObj.mobile ? 'mobile' : 'desktop');
            var percentageKey = 'data-vars-per-' + (variantObj.mobile ? 'mobile' : 'desktop');
            var activeKey = 'data-vars-active-' + (variantObj.mobile ? 'mobile' : 'desktop');

            var idData = getDataArrayFromDom(idKey);

            var indexToRemove = _.findIndex(idData, function(id) {
                return id == variantObj.id;
            });

            _.pullAt(idData, indexToRemove);
            replaceDataAttribute(idKey, idData);
            
            var percentageData = getDataArrayFromDom(percentageKey); 
            _.pullAt(percentageData, indexToRemove);
            replaceDataAttribute(percentageKey, percentageData);
            var activeData = getDataArrayFromDom(activeKey);
            _.pullAt(activeData, indexToRemove);
            replaceDataAttribute(activeKey, activeData);
        }

        function addId(id, mobile) {
            addDataAttribute('id', id, mobile);
        }

        function addPercentage(percentage, mobile) {
            addDataAttribute('per', percentage, mobile);
        }

        function addActive(active, mobile) {
            addDataAttribute('active', (active ? "1" : "0"), mobile);
        }

        function replaceDataAttribute(key, value) {
            $rootScope.frameBody.attr(key, value);
        }

        function removeDataAttribute(key, value, mobile) {

        }

        function addDataAttribute(key, value, mobile) {
            var attrToFind = 'data-vars-' + key + '-' + (mobile ? 'mobile' : 'desktop');
            var propertyValues = $rootScope.frameBody.attr(attrToFind);

            if (propertyValues) {
                propertyValues = propertyValues.split(',');

                if (key === 'id') {
                    propertyValues.push(value.toString());
                } else if (key === 'per') {
                    propertyValues.push(value.toString());
                } else if (key === 'active') {
                    propertyValues.push(value);
                }

                $rootScope.frameBody.attr(attrToFind, propertyValues);
            } else { //nothing there
                $rootScope.frameBody.attr(attrToFind, value);
            }
        }

        function getDataArrayFromDom(key) {
            var strValue = $rootScope.frameBody.attr(key);
            var dataVals = [];

            if (strValue) {
                dataVals = strValue.split(',');
            }

            return dataVals;
        }
    }

}());