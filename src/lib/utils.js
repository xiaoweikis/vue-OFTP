/**
 * Created by lenovo on 2018/6/24.
 */
let local = {
  download (url,fileName){
    var a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
    document.body.removeChild(a);
  },
  funDownload: function (url, filename) {
    $.ajax({
      type: 'POST',
      url: url,
      beforeSend: function (xhr) {  //beforeSend定义全局变量 
        xhr.overrideMimeType("text/plain;charset=gb18030");
      },
      success: function (data) {
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        // 字符内容转变成blob地址
        var blob = new Blob([data]);
        eleLink.href = URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
      }
    })

  },
};
export default {
  install: function(vm){
    vm.prototype.$local = local;
  }
}
