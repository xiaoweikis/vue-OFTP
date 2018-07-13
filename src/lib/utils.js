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
  }
};
export default {
  install: function(vm){
    vm.prototype.$local = local;
  }
}
