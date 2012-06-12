/*! SNAC beta2 | www.mavsic.ru/snac | WTFPL */

// STEN is a Snac Template ENgine
function Sten(container)
{
	// STEN directive
	var dirs = [];
	
	// collect information about directives from class names
	var collectDirs = function() {
		$(container + ' *').each(function () {
			if ($(this).attr('class') != undefined) {
				var classes = $(this).attr('class').split(/\s+/);
				for (c in classes) {
					var cl = classes[c];
					if (cl[0] == '$') {
						var datapiece_attr = cl.split('@');
						dirs.push({
							target: $(this),
							datapiece: datapiece_attr[0].substr(1),
							attr: datapiece_attr[1]
						});
					}
				}
			}
		});
	};
	
	this.render = function(data) {
		for (d in dirs) {
			var dir = dirs[d],
				value = data[dir.datapiece];
				
			if (dir.attr) dir.target.attr(dir.attr, value);
			else {
				dir.target.html(value);
				dir.target.toggle(value != undefined);
			}
		}
	}
	
	collectDirs();
}

// Snac is Not at All a Cms
function Snac()
{
	var page = null,
		page_data = {},
		cache = {},
		global_data = {},
		container = '#snac-content',
		snac_link = 'a.snac-link',
		current_link_class = 'snac-current',
		sten = new Sten(container);
	
	// loading global data
	$.ajax('global', {
		dataType: 'text',
		cache: false,
		success: function(d) {
			global_data = snacPage2Object(d)
		},
		error: function() {
			reportError('"global" file is missing in site/ directory');
		}
	});
	
	// bind a hashchange event by Ben Alman
	$(window).hashchange(function(e) {
		navigateTo(location.hash.substr(1));
	});
	
	// triggers hashchange event to make the whole thing start working
	this.start = function() {
		$(window).hashchange();
	}

	var navigateTo = function(where) {
		page = (where || 'index');
		
		// no cached page data found
		if (cache[page] == undefined) {
			// when global data and page data are loaded page is ready to be displayed
			$(container).ajaxStop(function() {
				$(this).unbind('ajaxStop');
				displayPage();
			});
			
			// load page data
			$.ajax(page, {
				dataType: 'text',
				cache: false,
				success: function(d) {	
					// save to cache
					page_data = cache[page] = snacPage2Object(d);
					
					if (page_data.header == undefined)
						reportError('missing non-optional "header" property in "' + page + '" page file');
				},
				error: function() {
					if (where == '404') reportError('file "404" not found');
					else navigateTo('404');
				}
			});
		}
		// read from cache
		else {
			page_data = cache[page];
			displayPage();
		}
	}
	
	// renders and displays page
	var displayPage = function() {
		document.title = page_data.header;
		sten.render($.extend(global_data, page_data)); // Yay, we've got STEN now!
		window.scrollTo(0, 0); // scrolling back to top
		processSnacLinks();
	}
	
	// changes SNAC link href
	var preprocessSnacLinks = function() {
		$(snac_link).each(function() {
			$(this).attr('href', '#' + $(this).attr('href'));
		});
	}
	
	// selects links to current page
	var processSnacLinks = function() {
		$(snac_link).each(function() {
			if ($(this).attr('href').substr(1) == page) $(this).addClass(current_link_class);
			else $(this).removeClass(current_link_class);
		});
	}
	
	// converts page file to javascript object
	var snacPage2Object = function(str) {
		var pairs = str.split(/^\$/m);
		var data = {};
		
		for (i in pairs) {
			if (i == 0) continue;
			var lines = pairs[i].split(/[\n\r]+/);
			// wow, that is kind of ugly
			data[lines.shift()] = lines.join('\r\n');
		}
		
		return data;
	}
	
	var reportError = function(error) {
		document.write('<strong>SNAC error:</strong> ' + error + '<br />');
	}
	
	preprocessSnacLinks();
}
	
$(function() {
	
	var snac = new Snac();
	snac.start();

});