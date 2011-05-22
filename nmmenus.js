YUI.add('nmmenus', function(Y){    
    Y.NMMenus = Y.Base.create('nmmenus', Y.Widget, [], { 
		initializer : function( config ) {
			// only run this stuff once
			if (Y.one('#' + this.get('menudivid')).hasClass('init')) { return; }
			
			// init variables for menuItemPulsate function
			this.set('pulsesleft', this.get('pulses'));
			this.set('pulseduration', this.get('pulseduration') / this.get('pulses'));									
								
			if (this.get('ajaxLoadFunc')) {
				// init menu observers for a tags
				this.get('ajaxLoadFunc')();
			}
			
			// make sure that top level menu items are not erronously marked as active
			Y.all('#' + this.get('menudivid') + ' .topLink').each(function(node) {
				if (!node.hasClass('hasSubMenu')) {				
					Y.on('mouseleave', function(e) {
						node.get('parentNode').removeClass('active');
					}, node);
				}
			});
		
			Y.all('#' + this.get('menudivid') + ' .hasSubMenu').each(function(node, idx) {
				var topLi = node.get('parentNode'),			
					subMenu = topLi.one('ul');																			
							
				// establish mouseenter observer
				Y.on('mouseenter', function(e) {
					// since we can't use "this" to reference this widget, reinit
					var nmmenu = new Y.NMMenus(config);							
					
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
								start:function() {
									subMenu.all('li').setStyles({
										visibility:'visible'										
									});
								},
								end:function() {									
									if (subMenu.hasClass('fluid')) {
										subMenu.setStyle('height', '');										
									}									
								}												
							}
						})
						break;
					}
				}, topLi);
				
				Y.on('mouseleave', function(e) {
					// hide menu
					var nmmenu = new Y.NMMenus(config);					
					nmmenu.hideNavMenu({
						topLi:topLi
					});
				}, topLi);							
			}, this);
			
			Y.one('#' + this.get('menudivid')).addClass('init');
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
			configObj.subMenu = configObj.topLi.one('.submenu');
			
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
		
		menuItemPulsate : function(ID, menuobj, callbackFunc, callbackArgs) {
			// mimics Script.aculo.us's Effect.Pulsate using YUI transition										

			Y.one('#' + ID).transition({
				opacity:0,
				duration:(menuobj.get('pulseduration') / 2),
				on : {
					end: function() {
						Y.one('#' + ID).transition({
							opacity:1,
							duration:(menuobj.get('pulseduration') / 2),
							on : {
								end:function() {																		
									if (menuobj.get('pulsesleft') > 1) {
										menuobj.set('pulsesleft', menuobj.get('pulsesleft') - 1);
										menuobj.menuItemPulsate(ID, menuobj, callbackFunc, callbackArgs)
									}
									else {
										// reset pulsesleft var									
										menuobj.set('pulsesleft', menuobj.get('pulses'));
										
										// hide menu
										menuobj.hideNavMenu({
											topLi:Y.one('#' + menuobj.get('menudivid') + ' li.active')
										});
										
										if (callbackFunc) {
											//Y.log('trigger callback');
											callbackFunc(callbackArgs);
										}
										else {
											// no custom JS load trigger, just navigate to href
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
			}
		}
    });
    
}, '0.1', {requires: ['base-build', 'widget', 'event-mouseenter', 'node', 'transition']});

YUI().use('nmmenus', 'event-delegate', function(Y) {
	var config = {
		anim:'blind',
		ajaxLoadFunc:Y.bind(ajaxLoadFunc('menublock'), this),
		pulses:2,
		pulseduration:0.3
	}
	
	var nmmenu = new Y.NMMenus(config);
	
	function ajaxLoadFunc(divtag) {
		Y.delegate("click", function(e) {
			e.preventDefault();
			nmmenu.menuItemPulsate(this.get('id'), nmmenu, ajaxLoadTrigger, {
				page:this.get('pathname'),
				id:this.get('id')
			});
		}, '#menublock .submenu', 'a');
	}

	function ajaxLoadTrigger(configObj) {
		switch (configObj.id) {
			case 'menu_JohnColtrane':
			//alert('do Coltrane thing');
			break;
			
			case 'menu_MilesDavis':
			//alert('do Miles Davis thing');
			break;
			
			default:
			window.location.href = configObj.page;
			break;
		}
	}
});
