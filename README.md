Features
--------

- Your own Javascript events that are triggered when certain menu items are selected
- "blind" or "fade" animations that utilize YUI Transitions. YUI Transitions utilize GPU accelerated CSS3 transitions by supported browsers, and fall back to timer based animations on browsers that don't. This means that on modern browsers your menus should be super responsive and not hindered by these animation triggers!
- in and out animation duration settings
- Desktop application style pulsate animation effects when a menu item has been selected, including pulsate settings

Philosophy
----------

If you are like me you'd find the lazy loading of the CSS and the markup that is common with most YUI widgets jarring when used in a navigation section in your site's global template because of this re-rendering of content. Therefore, this widget assumes that you will provide your own CSS and markup, and simply provides examples (below) you can tweak to your liking:

Markup/HTML
-----------

First, create the HTML that will be used to display your menus in the following format:

	<div id="menublock">
	    <ul> 
	        <li id='nm_id_home' class='nm_home'><a class='topLink' href='/'>Home</a></li> 
	        <li id='nm_id_artist' class='nm_artist'><a class='topLink' href='#'>Artist</a> 
	            <ul> 
	                <li> 
	                    <a id='menu_JohnColtrane' href='/artist/johncoltrane' class='top noajax'>John Coltrane</a> 
	                </li> 
	                <li> 
	                    <a id='menu_MilesDavis' href='/artist/milesdavis' class='middle'>Miles Davis</a> 
	                </li> 
	                <li> 
	                    <a id='menu_CliffordBrown' href='/artist/cliffordbrown' class='middle'>Clifford Brown</a> 
	                </li> 
	                <li> 
	                    <a id='menu_TheloniusMonk' href='/artist/theloniusmonk' class='middle'>Thelonius Monk</a> 
	                </li>        
	                <li> 
	                    <a id='menu_CharlieParker' href='/artist/charlieparker' class='middle'>Charlie Parker</a> 
	                </li>                                           
	                <li> 
	                    <a id='menu_BillEvans' href='/artist/billevans' class='middle'>Bill Evans</a> 
	                </li>
	                <li> 
	                    <a id='menu_CountBasie' href='/artist/countbasie' class='middle'>Count Basie</a> 
	                </li>
	                <li> 
	                    <a id='menu_StanKenton' href='/artist/stankenton' class='middle'>Stan Kenton</a> 
	                </li>
	                <li> 
	                    <a id='menu_ChetBaker' href='/artist/chetbaker' class='bottom'>Chet Baker</a> 
	                </li>
	            </ul> 
	        </li>
	    </ul>
	</div>


Node the div ID used as a wrapper for your menu (in this case *menublock*), you will need to provide this when the widget is instantiated if you wish to use an ID other than *menublock*. A whole plethora of additional CSS classes are attached so that you can skin these menus to your liking.


AJAX Driven Menus
-----------------

When *ajaxLoadFunc* is provided within the initializing config object, this function is invoked to set observers on each of the links in your navigation menus. These observers can then trigger Javascript functions for various menu items. If you want to skip any sort of Javascript controls for certain menu items, simply include the class *noajax*.

If you are interested in using the pulsate animation with your *ajaxLoadFunc* function, simply call on the function as follows:

	nmmenu.menuItemPulsate(this.get('id'), ajaxLoadTrigger, {
		page:this.get('pathname'),
		id:this.get('id')
	});

where the first argument is the CSS ID of the item that should pulsate (i.e. the link that was clicked on), the second argument should be the function that is triggered once the pulsate animation has been completed, and the third argument an object containing various arguments that should be passed on to this latter function specified as your third argument. If you study the usage example, below, you will see that we recommend sending your final Javascript function that acts on your menu selection both the CSS and pathname of the item that was clicked. This allows you to do different things depending on your selection and/or have exceptions/overrides to your default action.


Full Usage Example
------------------

	YUI({
		gallery:'gallery-2012.05.02-20-10'
	}).use('gallery-nmmenus', 'event-delegate', function(Y) {
		var config = {
			anim:'blind',
			ajaxLoadFunc:Y.bind(ajaxLoadFunc),
			pulses:2,
			pulseduration:0.3
		}
       
		var nmmenu = new Y.NMMenus(config);
       
   		function ajaxLoadFunc(nmmenu) {
			Y.all('#' + nmmenu.get('menudivid') + ' li a.topLink').each(function(node) {
				node = node.get('parentNode');

				Y.delegate('click', function(e) {
					if (this.get('href').match(/#$/) && this.hasClass('topLink')) {
						// cancel click
						e.preventDefault();
						return;
					}
					else if (Y.one('#' + this.get('id')).hasClass('noajax')) { 
						// abort, but do not cancel click
						return; 
					}
					e.preventDefault();
					if (this.hasClass('topLink')) {
						// top level link, do not init pulsate
						ajaxLoadTrigger({
							page:this.get('pathname'),
							id:this.get('id')
						})
					}
					else {
						nmmenu.menuItemPulsate(this.get('id'), ajaxLoadTrigger, {
							page:this.get('pathname'),
							id:this.get('id')
							});	
					}			
				}, node, 'a');		
			});
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