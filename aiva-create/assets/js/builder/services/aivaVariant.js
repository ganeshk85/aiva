(function() {
    'use strict';

    angular.module('builder').factory('aivaVariant', aivaVariant);

    aivaVariant.$inject = ['$rootScope', 'variantData', 'css'];

    function aivaVariant($rootScope, variantData, css) {

        var desktopVariants = [];
        var mobileVariants = [];

        var maxVariants = 5;

        // var varientObj = {
        //     id: 0,
        //     mobile: false,
        //     className: 'cta-lg-v0',
        //     percentage: 100,
        //     active: false,
        //     selected: false,
        // };

        var service = {
            createNewVariant: createNewVariant,
            getVariants: getVariants,
            loadVariantsFromProjectDom: loadVariantsFromProjectDom,
            getActiveVariants: getActiveVariants,
            getSelectedVariant: getSelectedVariant,
            getOldestVariant: getOldestVariant,
            activateVariant: activateVariant,
            selectDesktopVariant: selectDesktopVariant,
            selectMobileVariant: selectMobileVariant,
            deleteVariant: deleteVariant,
            updateDomProperty: updateDomProperty
        };

        return service;


        function createNewVariant(basedOnId, mobile) {
            var sameTypeVariants = getVariants(mobile); //only care about same type of variants, mobile or desktop
            var baseVariant = _.find(sameTypeVariants, ['id', basedOnId]);

            var maxId = _.maxBy(sameTypeVariants, function(variant) {
                return variant.id;
            });

            var newId = maxId.id + 1;

            var newVariant = {
                id: maxId.id + 1,
                mobile: mobile,
                className: 'cta-' + (mobile ? 'sm' : 'lg') + '-v' + newId,
                percentage: 0,
                active: false,
                selected: false
            };

            if (cloneCta(baseVariant, newVariant)) {
                pushVariant(newVariant, true);
                return newVariant.id;
            } else {
                return false;
            }
        }

        //get variant data from the body
        function loadVariantsFromProjectDom() {
            desktopVariants.length = 0;
            mobileVariants.length = 0;

            var body = $rootScope.frameBody;

            var desktopVariantIds = body.attr('data-vars-id-desktop');
            var mobileVariantIds = body.attr('data-vars-id-mobile');

            if (!desktopVariantIds) { //check for old project which wont have variant data attrs
                loadOldProject();

                //set new id class on to each variant
                _.forEach($rootScope.frameBody.find('.cta'), function(element, index) {
                    var wrappedElement = $(element);

                    if (typeof wrappedElement.attr('data-id') == 'undefined') {
                        applyCtaIdClass(wrappedElement, index);
                    }
                });

            } else {

                //set new id class on to each variant
                _.forEach($rootScope.frameBody.find('.cta'), function(element, index) {                    
                    var wrappedElement = $(element);

                    if (typeof wrappedElement.attr('data-id') == 'undefined') {
                        applyCtaIdClass(wrappedElement, index);
                    }
                });

                desktopVariantIds = desktopVariantIds.split(',');
                mobileVariantIds = mobileVariantIds.split(',');

                var desktopVariantPercentages = body.attr('data-vars-per-desktop');
                desktopVariantPercentages = desktopVariantPercentages.split(',');
                var mobileVariantPercentages = body.attr('data-vars-per-mobile');
                mobileVariantPercentages = mobileVariantPercentages.split(',');

                var desktopVariantActiveVals = body.attr('data-vars-active-desktop');
                desktopVariantActiveVals = desktopVariantActiveVals.split(',');
                var mobileVariantActiveVals = body.attr('data-vars-active-mobile');
                mobileVariantActiveVals = mobileVariantActiveVals.split(',');

                for (var i = 0; i < desktopVariantIds.length; i++) {
                    var desktopVariant = {
                        id: parseInt(desktopVariantIds[i]),
                        mobile: false,
                        className: 'cta-lg' + '-v' + desktopVariantIds[i],
                        percentage: parseInt(desktopVariantPercentages[i]),
                        active: (desktopVariantActiveVals[i] === "1"),
                        selected: (i === 0)
                    };

                    pushVariant(desktopVariant, false);
                }

                for (i = 0; i < mobileVariantIds.length; i++) {
                    var mobileVariant = {
                        id: parseInt(mobileVariantIds[i]),
                        mobile: true,
                        className: 'cta-sm' + '-v' + mobileVariantIds[i],
                        percentage: parseInt(mobileVariantPercentages[i]),
                        active: (mobileVariantActiveVals[i] === "1"),
                        selected: (i === 0)
                    };

                    pushVariant(mobileVariant, false);
                }
            }
        }

        function applyCtaIdClass(element, postFix) {
            var newId = 'cta-' + new Date().getTime() + postFix;

            element.attr('data-id', newId);
            element.addClass(newId);
        }

        function pushVariant(variant, updateDOM) {
            if (variant.mobile) {
                mobileVariants.push(variant);

                if (mobileVariants.length > maxVariants) {
                    mobileVariants = _.drop(mobileVariants, 1);
                }
            } else {
                desktopVariants.push(variant);

                if (desktopVariants.length > maxVariants) {
                    desktopVariants = _.drop(desktopVariants, 1);
                }
            }
            if (updateDOM) {
                variantData.addSingleVariantDataToDom(variant);

                var newVariantCta = $rootScope.frameBody.find('.' + variant.className);

                applyCtaIdClass(newVariantCta, (variant.mobile ? '1' : '0'));
            }
        }

        function loadOldProject() {
            var desktopCtas = $rootScope.frameBody.find('.cta-lg');
            var mobileCtas = $rootScope.frameBody.find('.cta-sm');

            var desktopAivaIds = [];

            _.forEach(desktopCtas, function(desktopCta, index) {
                var variantClass = getVariantClass(desktopCta);

                if (!variantClass) { //add variant class ('cta-lg-v0') to the cta divs if they dont have it

                    //if we get here, we know the user either created a new project and used an 'old' template or loaded an older project
                    _.forEach($(desktopCta).find('.aiva-elem'), function(elem) {
                        desktopAivaIds.push(elem.getAttribute('data-id'));
                    });


                    variantClass = addCtaVariantClasses(desktopCta, index, false);
                }

                var variantId = parseInt(variantClass.match(/\d+$/)[0]);
                var percentage = Math.floor(100 / (desktopCtas.length)); //usually will only be 1 desktop and 1 mobile in this case
                
                var variantObj = {
                    id: variantId,
                    mobile: false,
                    className: variantClass,
                    percentage: percentage,
                    active: true,
                    selected: (index === 0)
                };

                pushVariant(variantObj, false); //we update dom later
            });

            _.forEach(mobileCtas, function(mobileCta, index) {
                var variantClass = getVariantClass(mobileCta);

                if (!variantClass) {

                    _.forEach($(mobileCta).find('.aiva-elem'), function(elem) {

                        var wrappedElem = $(elem);

                        var elemId = wrappedElem.attr('data-id');

                        if (desktopAivaIds.indexOf(elemId) > -1) {
                            //we found duplicate ids

                            var newElemId = updateElementId(elemId);
                            wrappedElem.removeClass(elemId);
                            wrappedElem.addClass(newElemId);
                            wrappedElem.attr('data-id', newElemId);
                            css.upgradeOldProjectRules(elemId, newElemId, 'cta-sm');
                        }
                    });

                    variantClass = addCtaVariantClasses(mobileCta, index, true);
                }

                var variantId = parseInt(variantClass.match(/\d+$/)[0]);
                var percentage = Math.floor(100 / (mobileCtas.length));
                
                var variantObj = {
                    id: variantId,
                    mobile: true,
                    className: variantClass,
                    percentage: percentage,
                    active: true,
                    selected: (index === 0)
                };

                pushVariant(variantObj, false); //we update dom later
            });

            updateDomWithVariantData();
        }

        function getVariantClass(node) {
            var classes = node.className.split(/\s+/);
            
            var variantClass = _.find(classes, function(aClass) {
                return aClass.indexOf('-v') > -1;
            });

            return variantClass;
        }

        function updateDomWithVariantData() {
            variantData.addMultipleVariantDataToDom(desktopVariants);
            variantData.addMultipleVariantDataToDom(mobileVariants);
        }

        function addCtaVariantClasses(ctaNode, index, mobile) {
            var newClass = 'cta-' + (mobile ? 'sm' : 'lg') + '-v' + index;
            $(ctaNode).addClass(newClass);

            return newClass;
        }

        function getVariants(mobile) {
            return mobile ? mobileVariants : desktopVariants;
        }

        function getActiveVariants(mobile) {
            return _.filter(getVariants(mobile), function(variant) {
                return variant.active;
            });
        }

        function getSelectedVariant(mobile) {
            return _.find(getVariants(mobile), function(variant) {
                return variant.selected;
            });
        }

        function getOldestVariant(mobile) {
            return _.min(getVariants(mobile), function(variant) {
                return variant.id;
            });
        }

        function activateVariant(id) { //active = cta is displayed on client site. can be multiple active variants
            var variantToActivate = getVariantById(id);            
            variantToActivate.active = true;
        }

        function selectMobileVariant(variant) {
            return selectVariant(variant, true);
        }

        function selectDesktopVariant(variant) {
            return selectVariant(variant, false);
        }

        function selectVariant(variant, mobile) { //selected = displayed in the builder. only 1 selected (per desktop, mobile)
            var selectedVariant;

            if (_.isObject(variant)) {
                selectedVariant = variant;
            } else {
                selectedVariant = getVariantById(variant, mobile);
            }

            if (selectedVariant) {
                _.forEach(getVariants(mobile), function(variant) {
                    variant.selected = false;
                });

                selectedVariant.selected = true;
            }

            return selectedVariant;
        }

        function cloneCta(baseVariant, newVariant) {

            var baseVariantClone = $rootScope.frameBody.find('.' + baseVariant.className).clone();

            if (baseVariantClone.length > 0) {

                var ctaId = baseVariantClone.attr('data-id');

                if (ctaId) {
                    baseVariantClone.removeClass(ctaId);
                    baseVariantClone.removeAttr('data-id');
                }

                css.duplicateVariantRules(baseVariant.className, newVariant.className); //ctabase background and borders

                _.forEach(baseVariantClone.find('.aiva-elem'), function(elem) {
                    var wrappedElement = $(elem);

                    var oldElementId = wrappedElement.attr('data-id');
                    var newElementId = updateElementId(oldElementId); 

                    wrappedElement.removeClass(oldElementId);
                    wrappedElement.addClass(newElementId);
                    wrappedElement.attr('data-id', newElementId);
                    
                    css.duplicateElementRules(oldElementId, newElementId);
                });

                baseVariantClone.removeClass(baseVariant.className);
                baseVariantClone.addClass(newVariant.className);

                $rootScope.frameBody.append(baseVariantClone);

                return true;
            } else {
                return false;
            }
        }

        function updateDomProperty(variant, updatedProperty) {
            var idKey = 'data-vars-id-' + (variant.mobile ? 'mobile' : 'desktop');
            var propertyKey;
            if (updatedProperty === 'percentage') {
                propertyKey = 'data-vars-per-' + (variant.mobile ? 'mobile' : 'desktop');
            } else if (updatedProperty === 'active') {
                propertyKey = 'data-vars-active-' + (variant.mobile ? 'mobile' : 'desktop');
            }

            var idValues = variantData.getDataArrayFromDom(idKey);
            idValues = _.map(idValues, function(val) {
                return parseInt(val);
            });
            var propertyValues = variantData.getDataArrayFromDom(propertyKey);
            var variantIndex = _.findIndex(idValues, function(idVal) {
                return idVal == variant.id;
            });
            
            var propertyNewValues = [];

            if (updatedProperty === 'percentage') {
                propertyValues[variantIndex] = variant.percentage.toString();
            } else if (updatedProperty === 'active') {
                propertyValues[variantIndex] = variant.active ? "1" : "0";
            }

            variantData.replaceDataAttribute(propertyKey, propertyValues);
        }

        function getVariantById(id, mobile) {
            return _.find(getVariants(mobile), ['id', id]);
        }

        function deleteVariant(id, mobile) {

            var variants = getVariants(mobile);
            var removed = [];

            if (variants.length > 1) {
                removed = _.remove(variants, function(variant) {
                    return variant.id == id;
                });

                if (removed.length > 0) {
                    var removedCta = $rootScope.frameBody.children('.' + removed[0].className).detach();
                    variantData.removeVariantDataFromDom(removed[0], mobile);
                    
                    //todo: undo
                }
            }

            return (removed.length > 0);
        }

        function updateElementId(oldId) {
            var type = oldId.split('-')[0];
            return type + '-' + new Date().getTime();           
        }
    }

}());