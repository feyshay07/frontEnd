// help-system.module.js
(function() {
    'use strict';
    
    angular.module('helpSystem', [])
        
        // Help System Service
        .service('HelpSystemService', ['$http', '$q', '$window', function($http, $q, $window) {
            var service = this;
            var contentCache = {};
            
            // Load help content for a specific page
            service.loadContent = function(pageId) {
                if (contentCache[pageId]) {
                    return $q.when(contentCache[pageId]);
                }
                
                return $http.get('/help-content/' + pageId + '.json')
                    .then(function(response) {
                        contentCache[pageId] = response.data;
                        return response.data;
                    })
                    .catch(function(error) {
                        console.error('Failed to load help content for:', pageId, error);
                        return null;
                    });
            };
            
            // Check user permissions
            service.hasPermission = function(permission) {
                // Replace with your ERP's permission checking logic
                var userPermissions = $window.ERPUser ? $window.ERPUser.permissions : [];
                return !permission || userPermissions.indexOf(permission) !== -1;
            };
            
            // Filter navigation links by permissions
            service.filterNavigationLinks = function(links) {
                return links.filter(function(link) {
                    return service.hasPermission(link.permission);
                });
            };
            
            // Track help usage analytics
            service.trackHelpUsage = function(pageId, action, section) {
                // Implement your analytics tracking here
                console.log('Help Analytics:', {
                    pageId: pageId,
                    action: action,
                    section: section,
                    timestamp: new Date()
                });
            };
        }])
        
        // Theme Adapter Service
        .service('ThemeAdapterService', ['$window', function($window) {
            var service = this;
            
            service.getERPTheme = function() {
                var erpTheme = $window.ERPTheme || {};
                return {
                    primaryColor: erpTheme.primaryColor || '#007bff',
                    secondaryColor: erpTheme.secondaryColor || '#6c757d',
                    backgroundColor: erpTheme.backgroundColor || '#ffffff',
                    textColor: erpTheme.textColor || '#333333',
                    borderColor: erpTheme.borderColor || '#dee2e6',
                    fontFamily: erpTheme.fontFamily || 'Arial, sans-serif'
                };
            };
            
            service.applyTheme = function(element) {
                var theme = service.getERPTheme();
                var css = {
                    'font-family': theme.fontFamily,
                    'color': theme.textColor
                };
                element.css(css);
            };
        }])
        
        // Help Sidebar Directive
        .directive('helpSidebar', ['HelpSystemService', 'ThemeAdapterService', function(HelpSystemService, ThemeAdapterService) {
            return {
                restrict: 'E',
                scope: {
                    pageId: '@',
                    isOpen: '=',
                    onClose: '&'
                },
                template: `
                    <div class="help-overlay" ng-show="isOpen" ng-click="closeHelp()"></div>
                    <div class="help-sidebar" ng-class="{'help-sidebar-open': isOpen}">
                        <!-- Header -->
                        <div class="help-header">
                            <h2 class="help-title">{{helpContent.title}}</h2>
                            <button class="help-close-btn" ng-click="closeHelp()">
                                <span>&times;</span>
                            </button>
                        </div>
                        
                        <!-- Content -->
                        <div class="help-content" ng-if="helpContent">
                            <div class="help-description">
                                <p>{{helpContent.description}}</p>
                            </div>
                            
                            <!-- Help Sections -->
                            <div class="help-sections">
                                <div class="help-section" ng-repeat="section in helpContent.sections">
                                    <div class="help-section-header" ng-click="toggleSection(section.id)">
                                        <div class="help-section-title">
                                            <i class="help-icon" ng-class="getIconClass(section.icon)"></i>
                                            <span>{{section.title}}</span>
                                        </div>
                                        <i class="help-chevron" ng-class="{'help-chevron-down': expandedSections[section.id]}"></i>
                                    </div>
                                    
                                    <div class="help-section-content" ng-show="expandedSections[section.id]">
                                        <p class="help-section-overview">{{section.overview}}</p>
                                        
                                        <div class="help-steps" ng-if="section.steps">
                                            <h4>Steps:</h4>
                                            <ol>
                                                <li ng-repeat="step in section.steps">{{step}}</li>
                                            </ol>
                                        </div>
                                        
                                        <!-- Navigation Links -->
                                        <div class="help-nav-links" ng-if="section.navigationLinks.length > 0">
                                            <h4>Quick Actions:</h4>
                                            <div class="help-link-buttons">
                                                <a ng-repeat="link in section.navigationLinks" 
                                                   href="{{link.url}}" 
                                                   class="help-nav-link"
                                                   target="{{link.target || '_blank'}}"
                                                   ng-click="trackLinkClick(section.id, link.text)">
                                                    {{link.text}}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <!-- Frequently Asked Questions -->
                                <div class="help-quick-ref" ng-if="helpContent.FrequentlyAskedQuestions">
                                    <h3>Frequently Asked Questions</h3>
                                    <ul class="help-checklist">
                                        <li ng-repeat="item in helpContent.FrequentlyAskedQuestions">
                                            {{item}}
                                        </li>
                                    </ul>
                                </div>
                        
                        <!-- Loading State -->
                        <div class="help-loading" ng-if="!helpContent && isOpen">
                            <p>Loading help content...</p>
                        </div>
                    </div>
                `,
                link: function(scope, element, attrs) {
                    scope.helpContent = null;
                    scope.expandedSections = {};
                    
                    // Apply ERP theme
                    ThemeAdapterService.applyTheme(element);
                    
                    // Watch for sidebar open/close
                    scope.$watch('isOpen', function(newVal) {
                        if (newVal && scope.pageId) {
                            loadHelpContent();
                            HelpSystemService.trackHelpUsage(scope.pageId, 'open');
                        }
                    });
                    
                    // Load help content
                    function loadHelpContent() {
                        HelpSystemService.loadContent(scope.pageId)
                            .then(function(content) {
                                if (content) {
                                    scope.helpContent = content;
                                    // Filter navigation links by permissions
                                    scope.helpContent.sections.forEach(function(section) {
                                        if (section.navigationLinks) {
                                            section.navigationLinks = HelpSystemService.filterNavigationLinks(section.navigationLinks);
                                        }
                                    });
                                }
                            });
                    }
                    
                    // Toggle section expansion
                    scope.toggleSection = function(sectionId) {
                        scope.expandedSections[sectionId] = !scope.expandedSections[sectionId];
                        HelpSystemService.trackHelpUsage(scope.pageId, 'toggle_section', sectionId);
                    };
                    
                    // Close help sidebar
                    scope.closeHelp = function() {
                        scope.isOpen = false;
                        if (scope.onClose) {
                            scope.onClose();
                        }
                        HelpSystemService.trackHelpUsage(scope.pageId, 'close');
                    };
                    
                    // Get icon class based on icon name
                    scope.getIconClass = function(iconName) {
                        var iconMap = {
                            'users': 'fa fa-users',
                            'dollar': 'fa fa-dollar-sign',
                            'calendar': 'fa fa-calendar',
                            'receipt': 'fa fa-receipt',
                            'email': 'fa fa-envelope',
                            'settings': 'fa fa-cog'
                        };
                        return iconMap[iconName] || 'fa fa-question-circle';
                    };
                    
                    // Track navigation link clicks
                    scope.trackLinkClick = function(sectionId, linkText) {
                        HelpSystemService.trackHelpUsage(scope.pageId, 'navigation_link', sectionId + ':' + linkText);
                    };
                }
            };
        }])
        
        // Help Trigger Directive
        .directive('helpTrigger', function() {
            return {
                restrict: 'E',
                scope: {
                    pageId: '@',
                    position: '@'
                },
                template: `
                    <button class="help-trigger-btn" 
                            ng-class="'help-trigger-' + (position || 'top-right')"
                            ng-click="openHelp()"
                            title="Get Help">
                        <i class="fa fa-question-circle"></i>
                    </button>
                    <help-sidebar page-id="{{pageId}}" 
                                  is-open="helpOpen" 
                                  on-close="closeHelp()">
                    </help-sidebar>
                `,
                link: function(scope, element, attrs) {
                    scope.helpOpen = false;
                    
                    scope.openHelp = function() {
                        scope.helpOpen = true;
                    };
                    
                    scope.closeHelp = function() {
                        scope.helpOpen = false;
                    };
                }
            };
        })
        
        // Help System Controller (for programmatic access)
        .controller('HelpSystemController', ['$scope', 'HelpSystemService', function($scope, HelpSystemService) {
            var vm = this;
            
            vm.openHelp = function(pageId) {
                $scope.$broadcast('help:open', pageId);
            };
            
            vm.closeHelp = function() {
                $scope.$broadcast('help:close');
            };
            
            vm.trackUsage = function(pageId, action, section) {
                HelpSystemService.trackHelpUsage(pageId, action, section);
            };
        }]);
        
})();

// CSS Styles (help-system.css)
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "css/helpSystem.css"; // Make sure the path is correct
document.head.appendChild(link);
