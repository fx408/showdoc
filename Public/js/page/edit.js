var editormd;

$(function() {
  /*加载目录*/
  getCatList();

  function getCatList(){
      var default_cat_id = $("#default_cat_id").val();
      var item_id = $("#item_id").val();
      $.get(
        "../catalog/catList",
        { "item_id": item_id },
        function(data){
          $("#cat_id").html('<OPTION value="0">无</OPTION>');
          if (data.error_code == 0) {
            json = data.data;
            console.log(json);
            for (var i = 0; i < json.length; i++) {
                cat_html ='<OPTION value="'+json[i].cat_id+'" ';
                if (default_cat_id == json[i].cat_id ) {
                  cat_html += ' selected ';
                }

                cat_html +=' ">'+json[i].cat_name+'</OPTION>';
                $("#cat_id").append(cat_html);
            };
          };
          
        },
        "json"

        );
  }
  /*初始化编辑器*/
  editormd = editormd("editormd", {
      width   : "90%",
      height  : 1000,
      syncScrolling : "single",
      path    : DocConfig.pubile + "/editor.md/lib/" ,
      placeholder : "本编辑器支持Markdown编辑，左边编写，右边预览",
      imageUpload : true,
      imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp","JPG", "JPEG", "GIF", "PNG", "BMP", "WEBP"],
      imageUploadURL : "uploadImg",

  });

  /*插入API接口模板*/
  $("#api-doc").click(function(){
      var tmpl = $("#api-doc-templ").html();
      editormd.insertValue(tmpl);
  });
  /*插入数据字典模板*/
  $("#database-doc").click(function(){
      var tmpl = $("#database-doc-templ").html();
      editormd.insertValue(tmpl);
  });
  /*插入数据字典模板*/
  $("#api-get-doc").click(function(){
      var apiAddress = $("input[name=api-address]").val();
	  $.get(
        "/Home/api/getData",
        { "address": apiAddress },
        function(result) {
			if(result.error_code == 0) {
				var data = result.data;
				
				var contents = "**参数：** \n\n|参数名|类型|必选|说明|\n|:----    |:---|:----- |-----   |\n";
				contents += data.params+"\n\n";
				
				contents += " **返回值说明** \n\n|参数名|类型|说明|\n|:-----  |:-----|-----   \n";
				contents += data.response+"\n\n";
				
				editormd.insertValue(contents);
			}
        },
        "json"
	  );
  });
  
  /*解析sql语句*/
  $("#parse-sql").click(function() {
  	var sqlStr = $("textarea[name=create-sql]").val();
  	var sql = sqlStr.split("\n");
		var reg = /^`/;
		
		var res = [];
		
		res.push("****\n");
		res.push("- 表名：\n");
		res.push("- 是否分表：**是**\n");
		res.push('|字段|类型|空|默认|注释|');
		res.push('|:----    |:-------    |:--- |-- -|------      |');
		
		for(var i = 0; i < sql.length; i++) {
			var line = $.trim( sql[i] );
			var d = [' ', ' ', ' ', ' ', ' '];
			
			if(reg.test(line)) {
				var items = line.split(/\s+/);
				
				d[0] = items[0].replace(/`/g, "");
				d[1] = items[1];
				d[2] = line.indexOf("NOT NULL") == -1 ? '否' : '是';
				
				if(line.indexOf("DEFAULT") != -1)
					d[3] = line.match(/DEFAULT\s+(.*?)(?:\s|,)/)[1];
				
				if(line.indexOf("#") != -1)
					d[4] = line.split("#")[1];
				
				res.push('|' + d.join('|') + '|');
			}
		}
		
		res.push("\n**数据表结构**\n");
		res.push("```SQL");
		res.push(sqlStr);
		res.push("```");
  	
  	editormd.insertValue(res.join("\n"));
  });
  
  /*保存*/
  $("#save").click(function(){
    var page_id = $("#page_id").val();
    var item_id = $("#item_id").val();
    var cat_id = $("#cat_id").val();
    var page_title = $("#page_title").val();
    var page_content = $("#page_content").val();
    var item_id = $("#item_id").val();
    var order = $("#order").val();
    $.post(
      "save",
      {"page_id":page_id ,"cat_id":cat_id ,"order":order ,"page_content":page_content,"page_title":page_title,"item_id":item_id },
      function(data){
          if (data.error_code == 0) {
            alert("保存成功！");
            window.location.href="../item/show?page_id="+data.data.page_id+"&item_id="+item_id;
          }else{
            alert("保存失败！");

          }
      },
      'json'
      )
  })


});