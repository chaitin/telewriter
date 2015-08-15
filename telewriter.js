!function($){

  "use strict";

  var Telewriter = function(el, options){

    // chosen element to manipulate text
    this.el = $(el);
    // options
    this.options = $.extend({}, $.fn.telewriter.defaults, options);

    // console.log(this.options);

    // text content of element
    this.text = this.el.text();

    // typing speed
    this.speed = 0;

    // input strings of text
    this.input = this.options.input;

    this.loop = this.options.loop;

    // string buffer to be shown
    this.buffer = "";

    // mark of delete stop num
    this.mark = -1;

    // true for append, false for delete
    this.dir = true;

    // position
    this.pos = 0;

    // All systems go!
    this.build();
  }

  Telewriter.prototype =  {

    constructor: Telewriter

    , init: function(){
      // begin the loop w/ first current string (global self.string)
      // current string will be passed as an argument each time after this
      var self = this;
      self.typewrite()
    }

    , build: function(){
      // Insert cursor
      this.el.after('<span class="cursor" id="typed-cursor">┃</span>');
      this._cursor = $('#typed-cursor')
      this.init();
    }

    , tick:function(func, timeout){
      // console.log(this._paused, this._nextTick)
      if(!this._paused){
        this.__func = func
        this._nextTick = setTimeout(func, timeout)
        this._tick = Date.now()
        this._timeout = timeout
      }else{
        this.__func = func
        this._timeout = timeout
      }
    }

    // pass current string state to each function
    , typewrite: function() {

      // varying values for setTimeout during typing
      // can't be global since number changes each time loop is executed
      // var humanize = Math.round(Math.random() * (100 - 30)) + this.speed;
      var humanize = this.speed;
      var self = this;

      // console.log(self.pos, self.dir, self.mark, self.speed);

      /*
        ^_ sleep
        ^1000^  set speed
        ^^ ^
        ^* mark
        ^- delete
        ^+ append
      */
      if (self.dir == false) {
        if (self.buffer.length > self.mark) {
          if (self.speed == 0) {
            self.buffer = self.buffer.substr(0, self.mark);
            self.el.text(self.buffer);
            self.dir = true;
            self.tick(self.typewrite.bind(this), 0);
          } else {
            self.buffer = self.buffer.substr(0, self.buffer.length-1);
            self.el.text(self.buffer);
            self.tick(self.typewrite.bind(this), humanize);
          }
        } else {
          self.dir = true;
        }
        return;
      }

      if (self.pos >= self.input.length) {
        if (self.loop) {
          self.pos = 0;
          self.mark = -1;
          self.dir = true;
          self.buffer = "";
          self.tick(self.typewrite.bind(this), 0);
        }
        return;
      }

      var a = self.input[self.pos];

      if (a == '^') { // escape
        if (self.pos + 1 >= self.input.length) {
          // invalid end, ignore
          self.pos += 1;
          self.tick(self.typewrite.bind(this), 0);
        } else if (/^\^\d+\^/.test(self.input.substr(self.pos))) {
          var substr = /\d+/.exec(self.input.substr(self.pos+1))[0];
          var skip = substr.length;
          var newspeed = parseInt(substr);
          self.pos += 2 + skip;
          console.log("speed set from ", self.speed, " to ", newspeed);
          self.speed = newspeed;
          self.tick(self.typewrite.bind(this), 0);  // control symbol does not consume time
        } else if (self.input[self.pos+1] == '^') {
          self.pos += 2;
          self.buffer += '^';
          self.el.text(self.buffer);
          self.tick(self.typewrite.bind(this), humanize);
        } else if (self.input[self.pos+1] == '_') { // sleep
          self.pos += 2;
          self.tick(self.typewrite.bind(this), self.speed);
        } else if (self.input[self.pos+1] == '*') { // mark
          self.pos += 2;
          self.mark = self.buffer.length;
          self.tick(self.typewrite.bind(this), 0);
        } else if (self.input[self.pos+1] == '-') { // begin delete
          self.pos += 2;
          self.dir = false;
          self.tick(self.typewrite.bind(this), 0);
        }
      } else {
        if (self.dir) { // append
          if (self.speed == 0) {
            var j = self.pos+1;
            for (j = self.pos+1; j < self.input.length; j++) {
              if (self.input[j] == '^') break;
            }
            self.buffer += self.input.substr(self.pos, j - self.pos);
            self.pos = j;
            // self.buffer += a;
            self.el.text(self.buffer);
            self.tick(self.typewrite.bind(this), self.speed);
          } else {
            self.buffer += a;
            self.pos += 1;
            self.el.text(self.buffer);
            self.tick(self.typewrite.bind(this), self.speed);
          }
        } else {    // delete
        }
      }

      if(self.options.callback){
        self.options.callback()
      }
    }

    , pause: function() {
      this._paused = Date.now()
      console.log('Paused!', this._nextTick)
      this._cursor.removeClass('cursor')
      if(this._nextTick){
        clearTimeout(this._nextTick)
        this._nextTick = null
        this._timeout = this._timeout - (Date.now() - this._tick)
        if(this._timeout < 0){
          this._timeout = 0 
        }
      }else{
        // DO NOTHING
      }
    }

    , resume: function() {
      this._cursor.addClass('cursor')
      if(this._paused){
        this._paused = false
        console.log('Resume', this.__func, this._timeout)
        this.tick(this.__func, this._timeout)
      }else{
        //DO NOTHING
      }
    }
  }

  $.fn.telewriter = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('telewriter')
          , options = typeof option == 'object' && option
        if (!data) $this.data('telewriter', (data = new Telewriter(this, options)))
        if (typeof option == 'string') data[option]()
      });
  }

  $.fn.telewriter.defaults = {
    loop: true
  }
}(jQuery);
