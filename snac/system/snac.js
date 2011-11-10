$(function() {

	function Snac()
	{
		var page = null,
			templatefn = null,
			page_data = {},
			cache = {},
			global_data = {},
			template = '#snac-template',
			container = 'body',
			snac_link = 'a.snac-link',
			current_link_class = 'snac-current';
			
		// compile page template
		templatefn = $.jqotec(template, '$');
		
		// loading global data
		$.ajax('global', {
			dataType: 'text',
			cache: false,
			success: function(d) {
				global_data = snacPage2JSON(d)
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
						page_data = cache[page] = snacPage2JSON(d);
						
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
			$(container).jqotesub(templatefn, $.extend(global_data, page_data)); // render with jQote
			window.scrollTo(0, 0); // scrolling back to top
			processSnacLinks();
		}
		
		// changes SNAC link href and selects links to current page
		var processSnacLinks = function() {
			$(snac_link).each(function() {
				if ($(this).attr('href') == page) $(this).addClass(current_link_class);
				$(this).attr('href', '#' + $(this).attr('href'));
			});
		}
		
		// converts page file to JSON
		var snacPage2JSON = function(str) {
			var pairs = str.split(/[\r\n]+\s*\$\s*/);
			var data = {};
			for (var i = 0; i < pairs.length; i++)
			{
				if (i == 0) pairs[i] = pairs[i].replace(/\s*\$\s*/, '');
				if (pairs[i] == '') continue;
				
				var key_value = pairs[i].split(/\s*\$\s*[\r\n]+/, 2);
				data[key_value[0]] = key_value[1];
			}
			
			return data;
		}
		
		var reportError = function(error) {
			document.write('<strong>SNAC error:</strong> ' + error + '<br />');
		}
	}
	
	var snac = new Snac();
	snac.start();

});