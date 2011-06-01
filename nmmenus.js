var nmmenu = null;
YUI.add('nmmenus', function(Y){    
	
    Y.NMMenus = Y.Base.create('nmmenus', Y.Widget, [], {	 
		initializer : function( config ) {		
			// make user provided config available outside of this function and accessible without
			// having to create a new instance of object
			nmmenu = this;
			
			// determine submenu CSS class/ID
			submenuid = Y.one('#menublock .hasSubMenu').get('parentNode').one('ul').get('id');
			submenuclass = Y.one('#menublock .hasSubMenu').get('parentNode').one('ul').get('className');			
			if (submenuid) {
				this.set('submenu', '#' + submenuid);
			}
			else {
				this.set('submenu', '.' + submenuclass);
			}
			
			// init variables for menuItemPulsate function
			this.set('pulsesleft', this.get('pulses'));
			this.set('pulseduration', this.get('pulseduration') / this.get('pulses'));									
			
			if (!this.get('nopulsate') && !this.get('ajaxLoadFunc')) {
				// no custom AJAX stuff set, trigger menu item pulsate
				this.initNavMenuPulsate();
			}
			
			// make sure that top level menu items are not erronously marked as active
			Y.all('#' + this.get('menudivid') + ' .topLink').each(function(node) {
				Y.on('click', function(e) {
					if (node.get('href').match(/\/#$/)) {
						e.preventDefault();
					}
				}, node);
				
				if (!node.hasClass('hasSubMenu')) {				
					Y.on('mouseleave', function(e) {
						node.get('parentNode').removeClass('active');
					}, node);
				}
			});
			
			// add hasSubMenu class to all submenus
			Y.all('#' + this.get('menudivid') + ' ul li ul').addClass('hasSubMenu');
		
			Y.all('#' + this.get('menudivid') + ' .hasSubMenu').each(function(node, idx) {
				var topLi = node.get('parentNode'),			
					subMenu = topLi.one('ul');		
					
				if (this.get('ajaxLoadFunc')) {
					// add click observers					
					subMenu.all('li a').each(function(item) {
						if (!item.hasClass('noajax')) { 
							Y.on('click', function(e) {
								e.preventDefault();																				
								nmmenu.menuItemPulsate(item.get('id'), nmmenu, nmmenu.get('ajaxLoadFunc'), {
									page:'page-' + item.get('pathname'),
									path:item.get('pathname'),
									topLi:topLi
								});
							}, item)
						}
					});
				}																	
							
				// establish mouseenter observer
				Y.on('mouseenter', function(e) {					
					// make sure all other menus do not have .active class set											
					Y.all('#' + nmmenu.get('menudivid') + ' .hasSubMenu').get('parentNode').removeClass('active');																																												
					
					// mark menu as active
					topLi.addClass('active');
					
					// calculate menu dimensions
					var menuDimensions = nmmenu.calcMenuDimensions(subMenu);				
										
					switch (nmmenu.get('anim')) {
						case 'fade':
						subMenu.setStyles({
							opacity:0,
							display:'block',
							height:''
						});
						subMenu.transition({
							opacity:1,
							easing:'ease-out',
							duration:nmmenu.get('inDuration')
						});	
						break;
						
						case 'blind':
						// submenu needs to be set position:absolute so that parent li does not expand to fit menu width
						// set absolute position properites dynamically	
						subMenu.setStyles({
							height: '0px',
							display:'block',
							position:'absolute',
							top:node.getComputedStyle('height'),
							width:menuDimensions[0],
							opacity:1
						});
						// start transition
						subMenu.transition({
							height:menuDimensions[1],
							duration:nmmenu.get('inDuration'),
							easing:'ease-out',
							on : {								
								end:function() {									
									subMenu.setStyle('height', '');																																				
								}												
							}
						})
						break;
					}
				}, topLi);
				
				Y.on('mouseleave', function(e) {
					// hide menu
					nmmenu.hideNavMenu({
						topLi:topLi
					});
				}, topLi);							
			}, this);		
		},

		calcMenuDimensions : function(subMenu) {
			// return menu dimensions, need to temporarily unhide menu to measure it
			subMenu.setStyles({
				display: 'block',
				height:''
			});
			var menuHeight = subMenu.getComputedStyle('height');
			var menuWidth = subMenu.getComputedStyle('width');
			subMenu.setStyle('display', 'none');		
			
			return [menuWidth, menuHeight];
		},
		
		hideNavMenu : function(configObj) {
			// set subMenu property to use as an alias referencing the submenu, below
			configObj.subMenu = configObj.topLi.one(nmmenu.get('submenu'));			
			switch (this.get('anim')) {
				case 'fade':
				configObj.subMenu.transition({
					opacity:0,
					duration:this.get('outDuration'),
					easing:'ease-out',
					on : {
						end:function() {
							configObj.subMenu.setStyle('height', '0px');
							configObj.topLi.removeClass('active');						
						}
					}									
				});	
				break;

				case 'blind':				
				configObj.subMenu.transition({
					height:'0px',
					duration:this.get('outDuration'),
					easing:'ease-out',							
					on : {					
						end:function() {							
							configObj.subMenu.setStyle('display', 'none');
							configObj.topLi.removeClass('active');																																										
						}
					}
				})
				break;
			}
		},
		
		initNavMenuPulsate : function(callbackFunc, callbackArgs) {			
			Y.delegate("click", function(e) {
				// skip AJAX stuff for links marked with "noajax" class
				if (Y.one('#' + this.get('id')).hasClass('noajax')) { return; }
				e.preventDefault();
				nmmenu.menuItemPulsate(this.get('id'), nmmenu, callbackFunc, callbackArgs);
			}, '#' + nmmenu.get('menudivid') + ' ' + nmmenu.get('submenu'), 'a');
		},
			
		menuItemPulsate : function(ID, menuObj, callbackFunc, callbackArgs) {
			// mimics Script.aculo.us's Effect.Pulsate using YUI transition

			Y.one('#' + ID).transition({
				opacity:0,
				duration:(nmmenu.get('pulseduration') / 2),
				on : {
					end: function() {
						Y.one('#' + ID).transition({
							opacity:1,
							duration:(nmmenu.get('pulseduration') / 2),
							on : {
								end:function() {																		
									if (nmmenu.get('pulsesleft') > 1) {
										nmmenu.set('pulsesleft', nmmenu.get('pulsesleft') - 1);
										nmmenu.menuItemPulsate(ID, menuObj, callbackFunc, callbackArgs)
									}
									else {
										// reset pulsesleft var									
										nmmenu.set('pulsesleft', nmmenu.get('pulses'));
										
										// hide menu
										nmmenu.hideNavMenu({
											topLi:Y.one('#' + nmmenu.get('menudivid') + ' li.active')
										});
										
										if (callbackFunc) {
											Y.log('trigger callback');
											callbackFunc(callbackArgs);
										}
										else {
											// no custom JS load trigger, just navigate to href
											Y.log('load page');
											window.location.href = Y.one('#' + ID).get('pathname');
										}	
									}								
								}
							}
						})
					}
				}
			})
		}
	
		        
    }, {
        ATTRS : { 
			anim : {
				value : 'fade'
			},
			
			inDuration : {
				value : 0.35
			},
			
			outDuration : {
				value : 0.25
			},
			
			menudivid : {
				value : 'menublock'
			},
			
			pulses : {
				value : 2
			},
			
			pulseduration : {
				value : 0.3
			},
			
			ajaxLoadFunc : {
				
			}
		}
    });
    
}, '0.1', {requires: ['base-build', 'widget', 'event-mouseenter', 'node', 'transition']});
