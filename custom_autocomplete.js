/*
	The given function implements instant search for ecommerce websites
	built on shopify platform using its API. The purpose of this module is
    to list the names of all products whose properties contain the text entered in
    search box as substring. By clicking on any of the suggested name, the user will
    be directed to the product page.
    
    We have used shopify API which gives us products.json. One request contains a set of maximum
    250 products and can be passed with 'page' parameter for pagination.
    
    We have used jquery-ui for implementing autocomplete feature.

*/
var custom_autocomplete = function(ref, searchingLoaderRef) {
  "use strict";
  /*
  	productList contains a dictionary of list of product objects mapped with a page number.
    It stores the data fetched from the database.
  */
  var productList = {};
  
  
  /*
  	promiseList contains a dictionary of list of promises mapped with a page number.
  */
  var promiseList = {};
  
  
  /*
  	id of the section where results will appear.
  */
  var resultListUlRef = $('#ui-id-1');
  
  /*
  	url for calling list of 250 products for a given page.
  */
  var url = '/products.json?limit=250&page=';
  
  /*
  	Page required to make a request, default is 1.
  */
  var page = 1;
  
  /*
  	Maximum value of page which is required to make a request.
  */
  var pageMax = 10;
  
  /*
  	list of results after filtering all product lists fetched from the url.
  */
  var result = [];
  
    
  
  /*
  	The given function is used to check if products in a given product object list 
    pass through the criteria to get in result list. 
    
    The function takes 2 paramaters. First is data which is nothing but an array of
    product objects and second is text which is the value of search text box. Searching is case-insensitive and
    text is matched with the values of 5 properties of product object named:
    title, product_type, vendor, sku and handle. 
    
    Result in the form of array of objects is returned.
  */
  function filterResults(data, text) {
    text = text.toLowerCase();
    var len = data.length;
    var response = [];
    for(var i=0;i<len;i++) {
      var singleData = data[i];
      
      var title = singleData.title.toLowerCase();
      var product_type = singleData.product_type.toLowerCase();
      var vendor  = singleData.vendor.toLowerCase();
      var sku  = singleData.variants[0].sku.toLowerCase();
      var handle = singleData.handle;
      
      
      if(title.indexOf(text)>=0 || product_type.indexOf(text)>=0 || vendor.indexOf(text)>=0
        || sku.indexOf(text)>=0 || handle.indexOf(text)>=0) {
        
        response.push({id : handle, label : title })
      }
    }
    return response;
  };
  
  /*
	  The given function calls 'filterResults' function for every set of product list returned
      after hitting the url and populate the main 'result' list.
  */
  function checkAndFilter(data, response, text, id) {
    if(data.length) {
          var currentResult = filterResults(data, text);
          if (currentResult.length) {
            result = result.concat(currentResult);
          }
    }
  };
  
  /*
  	   When the product list fetched from a request is filtered, the given function
       checks whether results should be shown to the user or not. 
  */
  function checkAndShowResponse(response, page) {
    if(result.length) {
      $('#ui-id-1').addClass('autoCompleteResultSection');
      searchingLoaderRef.hide();
      response(result);
    } else if(page == pageMax) { /* If all products are scanned and no result is found */
      $('#ui-id-1').removeClass('autoCompleteResultSection');
      searchingLoaderRef.hide();
      response(['No Search Result']);
    }
  }
  
  /*
  	  The given function creates a promise object for every page request for fetching 
      product list as JSON. The promise object is then stored in promiseList dictionary
      mapped with page.
      
      The promise when gets resolved filters the returned product list and 
      shows the result if found.
  */
  function populateProductList(page, response, text, id) {
    if(!(page in promiseList))
	    promiseList[page] = $.ajax({
            url : url + page,
            dataType : 'json'
      });

    $.when(promiseList[page]).done(function(data, textStatus, xhr) {
      	if(data) {
                data = data.products;
                productList[page] = data;
                checkAndFilter(data, response, text, id);
                checkAndShowResponse(response, page);
        }
    });
    
  }
 
  /*
  	  The given function start instant searching for the text entered in
      the text box. The function first checks if the product list for every page is 
      present in 'productList' variable and if not found, fetches the data from the 
      database and store the returned list. Fetcing is done in async manner.
  */
  function autoCompleteSearchExamTextBox(response, id, text) {
    for (var page=1; page<= pageMax; page++) {
      if (page in productList) {
        checkAndFilter(productList[page], response, text, id);
        checkAndShowResponse(response, page);
      }
      else {  
        populateProductList(page, response, text, id)
      } 
    }
  };
  
  /*
  	Adding jquery ui autocomplete to the given text box.
  */

  function implementExamAutoComplete(id) {
     $(id).autocomplete({
      delay : 500,
      source : function(request, response) {
        $('#ui-id-1').hide();
        searchingLoaderRef.show();
        var text = $(id).val();
        page = 1;
        result = [];
        autoCompleteSearchExamTextBox(response, id, text);
      },
      select: function(event, ui) {
        window.location.href = '/products/' + ui.item.id;
      }
    });
  };
  
  implementExamAutoComplete(ref, );
  
  return {
    productList : productList
  }
};
