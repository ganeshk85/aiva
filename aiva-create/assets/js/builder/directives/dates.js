(function() {
    
    angular.module('builder').filter('nice_dt', function() {
        return function( strIso ) {

          if ( typeof strIso === 'object' ) {
              strIso = strIso.format('YYYY-MM-DD');
          } 
          if ( strIso === '0000-00-00' || strIso === '0000-00-00 00:00:00' ) {
              return '';
          }
          return moment(strIso).format('MM/DD/YYYY');
      };
    });
   
    angular.module('builder').filter('nice_dt_yy', function() {
        return function( strIso ) {

          if ( typeof strIso === 'object' ) {
              strIso = strIso.format('YYYY-MM-DD');
          } 
          if ( strIso === '0000-00-00' || strIso === '0000-00-00 00:00:00' ) {
              return '';
          }
          return moment(strIso).format('MM/DD/YY');
      };
   });
   
   
    angular.module('builder').filter('nice_date', function() {
      return function( strIso ) {

          if ( typeof strIso === 'object' ) {
              strIso = strIso.format('YYYY-MM-DD');
          }
          if ( strIso === '0000-00-00 00:00:00' ) {
              return '';
          }
          
          if ( strIso ) {
              var m_names = new Array("January", "February", "March", "Aprril", "May", "June", "July",
                "August", "September", "October", "November", "December");
              var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
              var dt = new Date( strIso );
              var sOut = days[ dt.getDay() ] + ", " +
                      m_names[ dt.getUTCMonth() ] + " " + (dt.getUTCDate());
              if ( dt.getUTCFullYear() !== (new Date()).getUTCFullYear() ) {
                 sOut += ", " + dt.getUTCFullYear();
              }
              return sOut;
          }
          return "";
      };
   });
   
    
})();