
	var filemanager = $('.filemanager'),
		breadcrumbs = $('.breadcrumbs'),
		menu = $('.modify'),
		fileList = filemanager.find('.data');
	var globalData = "";
	var currentBreadCrumb = "#";
	var currentFile = ""
	menu.hide()
/*
	
 - menu appears when file is clicked on
 	- options: view/download
*/


$.get('/json', function(data) {
	globalData = data;
	//display the files in the root
	display(data, '#')
	//set initial breadcrumb
	generateBreadCrumbTrail(data, '#')

	//clicking on an item
	fileList.on('click', 'li', function(e){
	    
	    //currently happening for everything - need to download file if not a folder
	    if ($(this).hasClass('folders')){
	    	fileList.empty();
	    	display(data, $(this).attr('id')); 
	    	currentFile = ""
	    	menu.hide();
	    } else { //its a file - hit the end point to download it
	    	// console.log($(this).attr('id'));
	    	// window.location.href = "/getfile?filename="+$(this).attr('id').replace("/ /g","_", -1);
	    	if ($(this).hasClass('clicked')) {
	    		$(this).removeClass('clicked')	
	    		currentFile = ""
	    		menu.hide();
	    	} else {
	    		currentFile = $(this).attr('id')
	    		$('li').removeClass('clicked')
	    		$(this).addClass('clicked')
	    		menu.show();	
	    	}
	    	
	    	// display(data, $(this).attr('parent'));
	    }

		
		 
	});
	menu.on('click', 'li', function() {
		console.log("download clicked");
		if (currentFile === "") {
			console.log("no file selected")
		} else {
			console.log(currentFile)
			window.location.href = "/getfile?filename="+currentFile.replace(/\s+/g,"_");	
		}
		
	});
	// fileList.on("contextmenu", "li", function(e){
	//    alert('Context Menu event has fired!');
	//    return false;
	// });
	//clicking on breadcrumbs
	breadcrumbs.on('click', '.folderName', function(){
		filemanager.find('input[type=search]').hide();
	    fileList.empty();
		display(data, $(this).attr('id'));
		currentBreadCrumb = $(this).attr('id');
		generateBreadCrumbTrail(data, $(this).attr('id'))
		currentFile = ""
	    menu.hide();
	});
	//handling search
	filemanager.find('.search').click(function(){
			toggleHidden(breadcrumbs)
			var search = $(this);
			//toggle showing the search box
			if (search.find('input[type=search]').css("display") == "inline-block") {
				// search.find('span').show();
				search.find('input[type=search]').hide();
				fileList.empty();
				display(data, currentBreadCrumb);
			} else {
				// search.find('span').hide();
				search.find('input[type=search]').show().focus();	
			}

	});
	//searching...
	filemanager.find('input').on('input', function(e){
		searchForFile(data, $('input[type=search]').val());
	});
});

function toggleHidden(item) {
    return item.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
}

function generateBreadCrumbTrail(data, parent) {
	breadcrumbs.empty()
	breadcrumbs.append( "<span class='arrow'>→</span> <span id='"+parent+"' class='folderName'>" + 	parent + "</span>")

	data.forEach(function(d){
		if (d.id === parent) { //this is the parent of the object that called this	
			generateBreadCrumbTrail(data, d.parent)
			breadcrumbs.append(" <span class='arrow'>→</span> <span id='"+parent+"' class='folderName'>" + parent + "</span>")
			currentBreadCrumb = parent;
		}
	})
}
function displayFolder(data, d){
	var itemsLength = countChildren(data, d.id),
		name = escapeHTML(d.id),
		icon = '<span class="icon folder"></span>';

	if(itemsLength == 1) {
		itemsLength += ' item';
	}
	else if(itemsLength > 1) {
		itemsLength += ' items';
	}
	else {
		itemsLength = 'Empty';
	}

	var folder = $('<li class="folders" parent="'+d.parent+'" id="'+d.id+'">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></li>');
	folder.appendTo(fileList);
}
function displayFile(data, d) {
	var fileSize = bytesToSize(d.size), //need to include file size in json
	name = escapeHTML(d.text),
	fileType = d.id.split('.'), //split the id, the name is just cosmetics...
	icon = '<span class="icon file"></span>';

	fileType = fileType[fileType.length-1];

	icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';

	var file = $('<li class="files" parent="'+d.parent+'" id="'+d.id+'">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></li>');
	file.appendTo(fileList);
}

//the idea is this function is recursive, and called when a folder is clicked on
function display(data, parent) {
	generateBreadCrumbTrail(data, parent)
	data.forEach(function(d){
				console.log(d.parent, " ", parent)
				if (d.parent === parent) {

					if(d.summary === 'directory') {
						// console.log("is folder")
						displayFolder(data, d);
					}
					else {	 //it must be a file
						// var fileSize = bytesToSize(f.size),
						displayFile(data, d)
					}
				}
			});
}


//simple HTML escaping
function escapeHTML(text) {
	return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
}

function countChildren(data, parent) {
		var numberOfChildren = 0;

			data.forEach(function(d){
				if (d.parent === parent){
					numberOfChildren++;
				}
			});
		return numberOfChildren;
}

function searchForFile(data, param) {
	fileList.empty();
	console.log($('.search'))
	data.forEach(function(d){
		if (d.id.toLowerCase().indexOf(param) > -1){
			if(d.summary === 'directory') {
				displayFolder(data, d)
			}
			else {
				displayFile(data, d)
			}
		}
	});
}

function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Bytes';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}