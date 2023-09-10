/* https://www.atmosera.com/blog/data-binding-pure-javascript/ */

export default class Binding {

  constructor(b) {
    var _this = this;

    this.element = b.element;
    this.type = b.type;
    this.value = b.object[b.property];
    this.attribute = b.attribute ? b.attribute : 'textContent';

    this.valueGetter = function(){
        return _this.value;
    }

    this.valueSetter = function(val) {
        _this.value = val;
        if (_this.element) {
          _this.element[_this.attribute] = _this.value;
        } else {
          console.log('No container for: ', _this.value);
        }
    }

    Object.defineProperty(b.object, b.property, {
        get: this.valueGetter,
        set: this.valueSetter
    });	

    b.object[b.property] = this.value;
    
    if (this.element) {
    this.element[this.attribute] = this.value;
    }
  }
}
