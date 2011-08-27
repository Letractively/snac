$(function() {

	function Snac()
	{
		var page = null,
			template = null,
			page_data = null,
			global_data = null,
			container = '#snacpage';
		
		// loading global data and page template
		$.get('site/global.txt', function(d) { global_data = snacPage2JSON(d) }, 'text')
			.error(function() { reportError('"global.txt" file is missing in site/ directory') });
		
		$.get('site/template.html', function(d) { template = $.jqotec(d, '$') }, 'html')
			.error(function() { reportError('Template file is missing in site/ directory') });
	
		this.start = function() {
			// trigger hashchange event to make the whole thing start working
			$(window).hashchange();
		}
	
		var navigateTo = function(where) {
			// if hash is empty then navigate to index
			page = (where || "index");
			
			// loading new page data
			$.get('site/' + page + '.txt', function(d) {	
				page_data = snacPage2JSON(d);
				
				// "header" property is required
				if (page_data.header == undefined)
					reportError('missing required "header" property in "' + page + '" page file');
			}, 'text').error(function() {
				if (where == '404')
					reportError('"404.txt" file is missing in site/ directory');
				else navigateTo('404');
			});
			
			// display page when global data, page data and template are loaded
			$(container).ajaxStop(function() {
				$(this).unbind('ajaxStop');
				displayPage();
			});
		}
		
		// render and display page
		var displayPage = function() {
			document.title = page_data.header;
			$(container).jqotesub(template, $.extend(global_data, page_data)); // render with jQote
			window.scrollTo(0, 0); // scrolling back to top
			selectCurrentMenuItem();
		}
		
		var selectCurrentMenuItem = function() {
			if (global_data.menu != undefined)
				$(global_data.menu).find('a[href="#!' + page + '"]').addClass('snac-current');
		}
		
		// convert page file to JSON
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
		
		// using hashchange event by Ben Alman
		$(window).hashchange($.proxy(function(e) {
			if (location.hash == '' || location.hash[1] == '!')
				navigateTo(location.hash.substr(2));
		}, this));
	}
	
	var snac = new Snac();
	snac.start();

});