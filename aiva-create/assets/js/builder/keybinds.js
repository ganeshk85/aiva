angular.module('builder')

.factory('keybinds', ['$rootScope', 'dom', 'undoRedo', 'aivaSelect', 'css', function($rootScope, dom, undoRedo, aivaSelect, css) {

	var keybinds = {

            init: function() {

                $(document).add($rootScope.frameDoc.documentElement).on('keydown', function(e) {
                    // console.log('keydown catched. target=', e.target.tagName, e.target.className);

                    if (e.target.tagName === 'INPUT' || 
                        e.target.tagName === 'SELECT' || 
                        e.target.tagName === 'BUTTON') {
                    
                        // if this is not a button/input/select in the builder, 
                        // then forbid further deals with keyboard
                        if (e.target.className.indexOf('aiva-elem') === -1) return; 
                    
                    } else {
                        if (e.target.tagName !== 'BODY') return; // forbid if you are not in the BODY
                        if (e.target.className.indexOf('ng-scope') !== -1) return; // forbid in context of other angular controllers
                    }

                    if (e.which === 38) { // arrow up
                            dom.moveSelected(e, 'up', e.shiftKey);
                    } else if (e.which === 40) { // arrow down
                            dom.moveSelected(e, 'down', e.shiftKey);
                    } else if (e.which === 37) { //arrow left
                            dom.moveSelected(e, 'left', e.shiftKey);
                    } else if (e.which === 39) { //arrow right  
                            dom.moveSelected(e, 'right', e.shiftKey);
                    } else if (e.which === 46 || e.which === 8) { // del or backspace
                            if (!aivaSelect.editing) {
                                    e.preventDefault();
                                    dom.deleteSelected();
                            }
                    } else if (e.which === 67 && (e.ctrlKey || e.metaKey)) { // C + Ctrl
                            if (!aivaSelect.editing) { //if user is editing, let browser handle the copy event
                                e.preventDefault();
                                dom.copyElement();
                            }
                    } else if (e.which === 86 && (e.ctrlKey || e.metaKey)) { // V + Ctrl
                            if (!aivaSelect.editing) { //if user is editing, let browser handle the paste event
                                e.preventDefault();
                                dom.paste();
                            }
                    } else if (e.which === 88 && (e.ctrlKey || e.metaKey)) { // X + Ctrl
                            e.preventDefault();
                            dom.copyElement(true);
                    } else if (e.which === 89 && (e.ctrlKey || e.metaKey)) { // Y + Ctrl
                            if (!aivaSelect.editing) {
                                    e.preventDefault();
                                    undoRedo.redo();
                            }
                    } else if (e.which === 90 && (e.ctrlKey || e.metaKey)) { // Z + Ctrl
                            if (!aivaSelect.editing) {
                                    e.preventDefault();
                                    undoRedo.undo();
                            }
                    }
                });
            }
	};

	return keybinds;
	
}]);