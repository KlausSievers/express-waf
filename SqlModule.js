/**
 * SQL Injection protection.
 */
(function() {
    var _config;
    var _patternSql  = [];
    var _blocker;
    var _logger;

    function SqlModule(config, blocker, logger) {
        _logger.log('configure SQLInjModule!');
        _config = config;
        _blocker = blocker;
        _logger = logger;

        var _xemplar = require('xemplar');
        _patternSql.push(_xemplar.security.sql)
    };

    SqlModule.prototype.check = function (req, res, cb) {
        logger.log('Check SQL Injection');
        var _host = req.ip;

        if (req.method === 'GET' || req.method === 'DELETE') {
            checkGetOrDeleteRequest(req, res, cb);
        } else if (req.method === 'POST' || req.method === 'PUT') {
            checkPostOrPutRequest(req, res, cb);
        }

        function checkPostOrPutRequest(req, res, cb) {
            if (req.body) {
                for(var i in req.body) {
                    for(var j in _patternSql){
                        if (_patternSql[j].test(req.body[i]) && _blocker.blockHost) {
                            handleAttack();
                            cb = undefined;
                            break;
                        }
                    }
                    if(!cb){
                        break;
                    }
                }
            }
            if (cb) {
                cb();
            }
        }

        function checkGetOrDeleteRequest(req, res, cb) {
            var _url = req.url;
            for(var i in _patternSql){
                if (_patternSql[i].test(_url) && _blocker.blockHost) {
                    handleAttack();
                    cb = undefined;
                    break;
                }
            }
            if (cb) {
                cb();
            }
        };

        function handleAttack() {
            _logger.logAttack('SQL Injection', _host);
            _blocker.blockHost(_host);
            res.status(403).send('Forbidden');
        };
    };





    module.exports = SqlModule;

})();