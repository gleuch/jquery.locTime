/*
 * locTime
 * jQuery plugin for adaptive localized date and time messages
 * Code inspired from jQuery.Timeago() by Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */

(function($) {
  $.locTime = function(timestamp) {};

  var $t = $.locTime;

  $.extend($.locTime, {
    settings : {
      timezone : false,
      refresh: 60000,
      allowFuture: false,
      allowYear : false,
      allow24Hour : false,
      allowAbbrevs : true,
      allowDayName : true,
      mode : false, /* 'date', 'time', or false (default) */
      strings: {
        prefixApprox : '', /* 'about' */
        prefixAgo: null,
        prefixFromNow: null,
        joinAt : 'at',
        suffixAgo: "ago",
        suffixFromNow: "from now",
        times : {
          seconds: "less than a minute",
          minute: "%approx a minute",
          minutes: "%d minutes",
          hour: "%approx an hour",
          hours: "%approx %d hours",
          day: "a day",
          days: "%d days",
          month: "%approx a month",
          months: "%d months",
          year: "%approx a year",
          years: "%d years"
        },
        dates : {
          tomorrow: 'Tomorrow', today: 'Today', yesterday: 'Yesterday',
          days : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
          daysAbbrev : ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'],
          months : ['January','February','March','April','May','June','July','August','September','October','November','December'],
          monthsAbbrev : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'],
          periods : {am:'am', pm:'pm'}, periodsAbbrev : {am:'a', pm:'p'}
        }
      }
    },
    date : false,

    make : function(elm, s) {
      var date = $.locTime.parse($(elm).attr('timestamp'));
      $.locTime.date = new Date();
      if (!isNaN(date)) $(elm).text($.locTime.modes(date, s)).attr('title', $.locTime.normalized(date));
    },
    normalized : function(stamp) {
      var s = stamp.toString(), exp = /([a-z]*)(\s)([a-z]*)(\s)([\d]*)(\s)([\d]*)(\s)([\d]*)(\:)([\d]*)(\:[\d]*)(\s)(.*)/i, exp_t = /(\d*)(.*)/, d = s.replace(exp, '$1, $3 $5, $7'), t = s.replace(exp, '$9:$11'), h = t.replace(exp_t, '$1');
      t = (h > 12 ? t.replace(new RegExp(h), h-12) : '') + (t > 11 && t < 23 ? 'pm' : 'am');
      return d +" "+ t;
    },
    modes : function(stamp, s) {
      var $l = s.strings, $t = $l.times, $d = $l.dates, words = false;

      if (/[a-z\s\-\_]?/i.test(stamp)) stamp = $.locTime.distance(stamp);

      var d = {z:stamp, s:0, m:0, h:0, d:0, y:0};
      d.s = d.z/1000; d.m = d.s/60; d.h = d.m/60; d.d = d.h/24; d.y = d.d/365;
      if (s.allowFuture) stamp = Math.abs(stamp);

      if (/(date|time)/i.test(s.mode)) {
        var approx = '', prefix = '', suffix = '', date = '', time = '', join = $l.joinAt;
        if (/date/i.test(s.mode)) date = $.locTime.mode.date(d, $d, s, approx);
        if (/time/.test(s.mode)) time = $.locTime.mode.time(d, s);
        words = $.trim([date, (/datetime/i.test(s.mode) ? join : ''), time].join(" "));
      } else {
        var approx = $l.prefixApprox, prefix = $l.prefixAgo, suffix = $l.suffixAgo || $l.ago;
        if (s.allowFuture && stamp < 0) var prefix = $l.prefixFromNow, suffix = $l.suffixFromNow || $l.fromNow;
        words = $.locTime.mode.words(d, $t, s, approx);
      }

      return $.trim([prefix, words, suffix].join(" "));
    },


    mode : {
      words : function(d, t, s, a) {
        return d.s < 45 && $.locTime.substitute(t.seconds, Math.round(d.s), a) ||
          d.s < 90 && $.locTime.substitute(t.minute, 1, a) ||
          d.m < 45 && $.locTime.substitute(t.minutes, Math.round(d.m), a) ||
          d.m < 90 && $.locTime.substitute(t.hour, 1, a) ||
          d.h < 24 && $.locTime.substitute(t.hours, Math.round(d.h), a) ||
          d.h < 48 && $.locTime.substitute(t.day, 1, a) ||
          d.d < 30 && $.locTime.substitute(t.days, Math.floor(d.d), a) ||
          d.d < 60 && $.locTime.substitute(t.month, 1, a) ||
          d.d < 365 && $.locTime.substitute(t.months, Math.floor(d.d / 30), a) ||
          d.y < 2 && $.locTime.substitute(t.year, 1, a) ||
          $.locTime.substitute(t.years, Math.floor(d.y), a);
      },
      date : function(d, t, s, a) {
        if (d.d < 2) {
          var s = $.locTime.offset(d.z).getDay(), n = $.locTime.date.getDay();
          return s == n && $.locTime.substitute(t.today, Math.floor(d.d), a) ||
            (s > n || n == 6 && s == 0) && $.locTime.substitute(t.tomorrow, Math.floor(d.d), a) ||
            (s < n || n == 0 && s == 6) && $.locTime.substitute(t.yesterday, Math.floor(d.d), a);
        } else {
          return $.locTime.format.date(s, d.z);
        }
          
      },
      time : function(d, s) {
        return $.locTime.format.time(s, d.z);
      }
    },

    offset : function(distance) {
      return new Date($.locTime.date-distance);
    },

    format : {
      date : function(s, distance) {
        var n = new Date(), t = $.locTime.offset(distance),
          w = t.getDay(), m = t.getMonth(), d = t.getDate(), y = t.getFullYear(),
          allowYear = (s.allowYear || n.getFullYear() != y),
          day = (s.allowDayName ? (s.allowAbbrevs ? s.strings.dates.daysAbbrev[w] : s.strings.dates.days[w])+',' : ''),
          month = (s.allowAbbrevs ? s.strings.dates.monthsAbbrev[m] : s.strings.dates.months[m])
          date = d+(allowYear ? ',' : ''),
          year = (allowYear ? y : '');
        return $.trim([day, month, date, year].join(" "));
      },
      time : function(s, distance) {
        var t = $.locTime.offset(distance),
          h = t.getHours(), m = t.getMinutes(),
          hour = (s.allow24Hour ? h : (h > 12 ? h-12 : h)),
          min = (m > 9 ? m : '0'+m),
          z = (false && s.allowAbbrevs ? s.strings.dates.periodsAbbrev : s.strings.dates.periods),
          period = (!s.allow24Hour ? (h >= 11 && h < 23 ? z.pm : z.am) : '');
        return hour+':'+min+period;
      }
    },
    parse: function(iso8601) {
      var str = $.trim(iso8601);
      str = str.replace(/\-/g,'/');
      str = str.replace(/T/,' ');
      str = str.replace(/Z/,' UTC');
      str = str.replace(/([\+-]\d\d)\:?(\d\d)/," $1$2");
      return new Date(str);
    },
    distance : function(date) {
      return $.locTime.date - new Date(date).getTime();
    },
    substitute : function(sf, val, approx) {
      var str = $.isFunction(sf) ? sf(val) : sf;
      return str.replace(/%d/i, val).replace(/%approx/i, approx);
    }
  });

  $.fn.locTime = function(settings) {
    var self = this;
    if (self.length > 0) {
      /* Need to see if something better exists for this. */
      var s = $.extend(true, $.evalJSON($.toJSON($.locTime.settings)), settings);
      self.each(function() {
        var rel = self.attr('rel') || 'ago';
        if (s.mode != rel) s.mode = rel;
        $.locTime.make(this, s);
      });
      if (s.refresh > 0) setInterval(function() {self.each(function() {$.locTime.make(this, s);}); }, s.refresh);
    }
    return self;
  };
})(jQuery);