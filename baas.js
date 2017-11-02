/*!
 * NEC Mobile Backend Platform JavaScript SDK version 6.5.0
 *
 * Copyright (C) 2014-2017, NEC CORPORATION
 * All rights reserved.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

var XMLHttpRequest, localStorage;


(function(){ 
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var root = this;
if (typeof window !== "undefined" && window !== null) {
}
else {
}
var nbError = function (message) {
    if (typeof console !== "undefined") {
        console.log("[BAAS ERROR] : " + message);
    }
};
var nbLogger = function (message) {
    if (Nebula.getDebugMode() === "debug" && typeof console !== "undefined") {
        console.log("[BAAS] : " + message);
    }
};
var _doBadRequestCallback = function (callbacks, name) {
    nbLogger(name + "#invalid parameter.");
    var error = _createError(400, "Invalid Arguments", "Invalid Arguments");
    if (callbacks && callbacks.error) {
        callbacks.error(error);
        return;
    }
    else {
        return Promise.reject(error);
    }
};
var _promisify = function (promise, callbacks) {
    if (callbacks) {
        promise.then(function (arg) {
            if (callbacks.success) {
                callbacks.success(arg);
            }
        }).catch(function (err) {
            if (callbacks.error) {
                callbacks.error(err);
            }
        });
        return undefined;
    }
    else {
        return promise;
    }
};
var _createError = function (status, statusText, responseText, data) {
    var error = new Error(statusText + "(" + status + ")");
    error.status = status;
    error.statusText = statusText;
    error.responseText = responseText;
    if (data) {
        error.data = data;
    }
    return error;
};
var _errorText = function (error) {
    if (error && error.message) {
        return error.message;
    }
    return error;
};
var _isObject = function (value) {
    var type = typeof value;
    return value && type === 'object' || type === 'function';
};
var _compareObject = function (src, target) {
    var srcKeys = Object.keys(src);
    var targetKeys = Object.keys(target);
    if (srcKeys.length !== targetKeys.length) {
        return false;
    }
    for (var _i = 0, srcKeys_1 = srcKeys; _i < srcKeys_1.length; _i++) {
        var key = srcKeys_1[_i];
        if (_isObject(src[key]) && _isObject(target[key])) {
            if (!_compareObject(src[key], target[key])) {
                return false;
            }
        }
        else {
            if (src[key] !== target[key]) {
                return false;
            }
        }
    }
    return true;
};
var nbAssert = function (assert, message) {
    if (!assert) {
        if (Nebula.getDebugMode() === "debug") {
            throw new Error("Assertion failed. " + message);
        }
        else {
            nbError("Assertion failed. " + message);
        }
    }
};
var HttpRequest = (function () {
    function HttpRequest(service, path, option) {
        this._onReadyStateChange = this._onReadyStateChange.bind(this);
        nbLogger("HttpRequest#start:path = " + path);
        this._service = service;
        this._xhr = null;
        this._url = this._service.getBaseUri();
        if (!(option && option.noprefix)) {
            this._url += "/" + this._service.getRestApiVersion() + "/" + this._service.getTenantID();
        }
        this._url = encodeURI(this._url) + path;
        this._headers = {};
        this._contentType = null;
        this._responseType = null;
        this._queryParams = null;
        this._data = null;
        this._receiveResponseHeaders = false;
        this._timeout = HttpRequest.getDefaultTimeout();
        var _currentObj = this._service.getCurrentUser();
        if (_currentObj === null) {
            this._sessionToken = null;
        }
        else {
            this._sessionToken = _currentObj.sessionToken;
        }
    }
    HttpRequest.setHttpAgent = function (agent) {
        HttpRequest._httpAgent = agent;
    };
    HttpRequest.setHttpsAgent = function (agent, options) {
        HttpRequest._httpsAgent = agent;
        HttpRequest._httpsAgentOptions = options;
    };
    Object.defineProperty(HttpRequest.prototype, "responseHeaders", {
        get: function () {
            return this._responseHeaders;
        },
        enumerable: true,
        configurable: true
    });
    HttpRequest.setDefaultTimeout = function (timeout) {
        this._defaultTimeout = timeout;
    };
    HttpRequest.getDefaultTimeout = function () {
        return this._defaultTimeout;
    };
    HttpRequest.prototype._hasXhr = function () {
        return typeof XMLHttpRequest !== "undefined";
    };
    HttpRequest.prototype._createXhr = function () {
        if (!this._hasXhr()) {
            throw new Error("No XMLHttpRequest");
        }
        return new XMLHttpRequest();
    };
    HttpRequest.prototype.setReceiveResponseHeaders = function (receive) {
        this._receiveResponseHeaders = receive;
        return this;
    };
    HttpRequest.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
            _this._headers["X-Application-Id"] = _this._service.getAppID();
            _this._headers["X-Application-Key"] = _this._service.getAppKey();
            if (_this._contentType !== null) {
                _this._headers["Content-Type"] = _this._contentType;
            }
            if (_this._sessionToken !== null) {
                _this._headers["X-Session-Token"] = _this._sessionToken;
            }
            var url = _this._url;
            if (_this._queryParams) {
                var p = [];
                for (var _i = 0, _a = Object.keys(_this._queryParams); _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (_this._queryParams.hasOwnProperty(key)) {
                        p.push(encodeURIComponent(key) + "=" + encodeURIComponent(_this._queryParams[key]));
                    }
                }
                if (p.length > 0) {
                    url += "?" + p.join("&");
                }
            }
            var body;
            if (!(_this._data != null)) {
                body = null;
            }
            else if ((typeof _this._data === "string") || (typeof Blob !== "undefined" && Blob !== null && _this._data instanceof Blob) || (typeof Buffer !== "undefined" && Buffer !== null && Buffer.isBuffer(_this._data))) {
                body = _this._data;
            }
            else {
                body = JSON.stringify(_this._data);
            }
            if (_this._hasXhr()) {
                _this._doXhr(url, body);
            }
            else {
                _this._doNodeRequest(url, body);
            }
        });
    };
    HttpRequest.prototype._doXhr = function (url, body) {
        var _this = this;
        this._xhr = this._createXhr();
        this._xhr.open(this._method, url, true);
        this._xhr.onreadystatechange = this._onReadyStateChange;
        for (var _i = 0, _a = Object.keys(this._headers); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = this._headers[key];
            this._xhr.setRequestHeader(key, value);
        }
        this._xhr.timeout = this._timeout;
        this._xhr.ontimeout = function (e) {
            _this._onXhrTimeout(e);
        };
        try {
            var userAgent = root.navigator.userAgent.toLowerCase();
            if (userAgent.match(/msie/) || userAgent.match(/trident/)) {
                this._xhr.setRequestHeader("Pragma", "no-cache");
                this._xhr.setRequestHeader("Cache-Control", "no-cache");
                this._xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");
            }
            else {
            }
        }
        catch (e) {
        }
        if (this._responseType != null) {
            this._xhr.responseType = this._responseType;
        }
        this._xhr.send(body);
    };
    HttpRequest.prototype._onReadyStateChange = function () {
        var xhr = this._xhr;
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                var body = (xhr.response != null) ? xhr.response : xhr.responseText;
                if (this._receiveResponseHeaders) {
                    return this._resolve({
                        body: body,
                        headers: xhr.getAllResponseHeaders(),
                        status: xhr.status
                    });
                }
                else {
                    return this._resolve(body);
                }
            }
            else {
                var error = _createError(xhr.status, xhr.statusText, "");
                if (xhr.responseType !== "blob") {
                    error.responseText = xhr.responseText;
                }
                if (xhr.status === 0) {
                    error.statusText = "Not Found";
                    error.responseText = "Not found anything that matches the request URI.";
                }
                nbError("HTTP Request Error: " + error.message + " " + error.responseText);
                return this._reject(error);
            }
        }
    };
    HttpRequest.prototype._onXhrTimeout = function (e) {
        var error = _createError(0, "Timeout error", e.toString());
        nbError("HTTP Response Error: Timeout Error: " + e.toString());
        this._reject(error);
    };
    HttpRequest.prototype._doNodeRequest = function (urlString, body) {
        var _this = this;
        var URL = require('url');
        var https = require('https');
        var http = require('http');
        var url;
        try {
            url = URL.parse(urlString);
        }
        catch (e) {
            nbError("Bad URL: " + urlString);
            this._reject(_createError(0, "Bad URL: " + urlString, ""));
            return;
        }
        var isHttps = (url.protocol === 'https:');
        var options = {
            method: this._method,
            hostname: url.hostname,
            port: url.port,
            path: url.path,
            headers: this._headers,
            agent: isHttps ? HttpRequest._httpsAgent : HttpRequest._httpAgent,
            timeout: this._timeout,
            pfx: null,
            passphrase: null,
            key: null,
            cert: null,
            ca: null,
            rejectUnauthorized: true
        };
        if (isHttps) {
            var allowedClientCertOptions = ['pfx', 'passphrase', 'key', 'cert', 'ca'];
            var clientCertOptions = this._service._config.clientCertOptions;
            if (clientCertOptions != null) {
                for (var key in clientCertOptions) {
                    if (allowedClientCertOptions.indexOf(key) >= 0) {
                        options[key] = clientCertOptions[key];
                    }
                    else {
                        nbError('invalid parameter ' + key + ' detected. value: ' + JSON.stringify(clientCertOptions[key]));
                        this._reject(_createError(0, 'invalid parameter: ' + key, ' value: ' + JSON.stringify(clientCertOptions[key])));
                        return;
                    }
                }
            }
            if (this._service._config.allowSelfSignedCert) {
                options.rejectUnauthorized = false;
                nbLogger('HTTPS Request Warning : accept self-signed certificate. make sure the risk of this setting.');
            }
            else {
                options.rejectUnauthorized = true;
            }
        }
        if (isHttps && options.agent != null && HttpRequest._httpsAgentOptions != null) {
            try {
                var tls = require('tls');
                tls.createSecureContext(HttpRequest._httpsAgentOptions);
            }
            catch (e) {
                nbError("HttpsAgentOptions invalid. check proxy options " + e.toString());
                var error = _createError(0, "Client Error", e.toString());
                this._reject(error);
                return;
            }
        }
        var httpx = isHttps ? https : http;
        var req = httpx.request(options, function (res ) {
            var status = res.statusCode;
            var chunks = [];
            _this._responseHeaders = res.headers;
            res.on('data', function (data) {
                chunks.push(data);
            });
            res.on('end', function () {
                var buffer = Buffer.concat(chunks);
                var responseBody = _this._parseNodeResponse(buffer);
                if (200 <= status && status < 300) {
                    if (_this._receiveResponseHeaders) {
                        _this._resolve({
                            body: responseBody,
                            headers: res.headers,
                            status: status
                        });
                    }
                    else {
                        _this._resolve(responseBody);
                    }
                }
                else {
                    var responseText = (_this._responseType !== "buffer" && responseBody != null) ? responseBody.toString() : "";
                    var error = _createError(status, res.statusMessage, responseText, responseBody);
                    nbError("HTTP Response Error: status=" + status + " - " + res.statusMessage);
                    _this._reject(error);
                }
            });
            res.on('error', function (e) {
                var error = _createError(0, "Client Error", e.toString());
                nbError("HTTP Response Error: Client Error: " + e.toString());
                _this._reject(error);
            });
        });
        req.on('error', function (e) {
            var error = _createError(0, "HTTP request error", e.toString());
            nbError("HTTP Request Error: " + e.toString());
            _this._reject(error);
        });
        if (body != null) {
            if (typeof body === "string" || body instanceof String || body instanceof Buffer) {
                req.write(body);
            }
            else {
                req.write(JSON.stringify(body));
            }
        }
        req.end();
    };
    HttpRequest.prototype._parseNodeResponse = function (buffer) {
        try {
            switch (this._responseType) {
                default:
                case 'text':
                    return buffer.toString('utf-8');
                case 'json':
                    var s = buffer.toString('utf-8');
                    try {
                        return JSON.parse(s);
                    }
                    catch (e) {
                        return s;
                    }
                case 'buffer':
                    return buffer;
            }
        }
        catch (e) {
            nbError("bad response: e=" + e.toString());
            return null;
        }
    };
    HttpRequest.prototype.setMethod = function (method) {
        this._method = method;
        return this;
    };
    HttpRequest.prototype.setContentType = function (contentType) {
        this._contentType = contentType;
        return this;
    };
    HttpRequest.prototype.setQueryParams = function (params) {
        this._queryParams = params;
        return this;
    };
    HttpRequest.prototype.setQueryParam = function (key, value) {
        if (!this._queryParams) {
            this._queryParams = {};
        }
        this._queryParams[key] = value;
        return this;
    };
    HttpRequest.prototype.setData = function (data) {
        this._data = data;
        return this;
    };
    HttpRequest.prototype.setSessionToken = function (sessionToken) {
        this._sessionToken = sessionToken;
        return this;
    };
    HttpRequest.prototype.setResponseType = function (responseType) {
        this._responseType = responseType;
        return this;
    };
    HttpRequest.prototype.addRequestHeader = function (header, value) {
        if (this._headers[header] !== undefined) {
            nbLogger("HTTP Request Warning : This header already exists.");
        }
        this._headers[header] = value;
        return this;
    };
    HttpRequest._defaultTimeout = 0;
    return HttpRequest;
}());
var _SdeRequest = (function () {
    function _SdeRequest(className, methodName) {
        nbLogger("_SdeRequest(), className=" + (className) + ", methodName=" + (methodName));
        this._className = className;
        this._methodName = methodName;
        this._data = null;
    }
    _SdeRequest.prototype.setData = function (data) {
        return this._data = data;
    };
    _SdeRequest.prototype.execute = function () {
        var callbacks = {};
        var promise = new Promise(function (resolve, reject) {
            callbacks.success = resolve;
            return callbacks.error = reject;
        });
        var reqId = _SdeRequest._createRequestId();
        _SdeRequest._callbacks[reqId] = callbacks;
        nbLogger("_SdeRequest.execute(), reqId=" + reqId);
        if (!(this._data != null)) {
            this._data = {};
        }
        var data = {
            data: this._data 
        };
        var sdeParams = {
            action: ((this._className) + "." + (this._methodName)),
            request_id: reqId,
            params: JSON.stringify(data),
            callback: "Nebula._SdeRequest.sdeCallback"
        };
        nbLogger("_SdeRequest.execute(), sdeParams=" + JSON.stringify(sdeParams));
        sde.smt.common.exIfExecute("NebulaSdePlugin", "execute", sdeParams);
        return promise;
    };
    _SdeRequest._createRequestId = function () {
        for (var i = 0; i < 1000; i++) {
            var requestId = "id_" + this._requestId;
            this._requestId++;
            if (this._requestId >= 1000) {
                this._requestId = 0;
            }
            if (!this._callbacks[requestId]) {
                nbLogger("_SdeRequest._createRequestId(), requestId=" + requestId);
                return requestId;
            }
        }
        nbLogger("FATAL Error: Nebula._SdeRequest._createRequestId(), callback slot full!");
        throw "Could not create request ID, callback slot full!";
    };
    _SdeRequest.sdeCallback = function (params) {
        try {
            nbLogger("_SdeRequest.sdeCallback()");
            nbLogger("  params=" + JSON.stringify(params));
            nbLogger("  requestId=" + params.requestId);
            nbLogger("  status=" + params.status);
            nbLogger("  statusText=" + params.statusText);
            nbLogger("  responseText=" + params.responseText);
            nbLogger("  response=" + params.response);
            var requestId = params.requestId;
            if (requestId != null && _SdeRequest._callbacks[requestId] != null) {
                var callbacks = _SdeRequest._callbacks[requestId];
                nbLogger("  requestId=" + requestId);
                nbLogger("  _callbacks[requestId]=" + callbacks);
                var status_1 = params.status;
                if (!status_1) {
                    nbLogger("_SdeRequest.sdeCallback(), warning:: not found status property");
                    status_1 = 0;
                }
                if (status_1 >= 200 && status_1 < 300) {
                    nbLogger("_SdeRequest.sdeCallback(), call success callback");
                    callbacks.success(JSON.stringify(params.response));
                }
                else {
                    var errorResult = _createError(params.status, params.statusText, params.responseText);
                    nbLogger("Nebula._SdeRequest.sdeCallback(), call error callback: " + errorResult.message
                        + " " + errorResult.responseText);
                    callbacks.error(errorResult);
                }
                delete _SdeRequest._callbacks[requestId];
                nbLogger("_SdeRequest.sdeCallback(), _callbacks : " + JSON.stringify(_SdeRequest._callbacks));
            }
            else {
                nbError("_SdeRequest.sdeCallback(), not found requestId=" + requestId);
            }
        }
        catch (e) {
            nbError("_SdeRequest.sdeCallback(), e=" + e);
        }
    };
    _SdeRequest._callbacks = {};
    _SdeRequest._requestId = 0;
    return _SdeRequest;
}());
var _SdeNetworkEventListener = (function () {
    function _SdeNetworkEventListener() {
    }
    _SdeNetworkEventListener.setCallback = function (callback) {
        this._callback = callback;
        nbLogger("_SdeNetworkEventListener.setCallback(), callback=" + callback);
        var data = {};
        if (callback) {
            data.set = true;
        }
        else {
            data.set = false;
        }
        var sdeParams = {
            params: JSON.stringify(data),
            callback: ""
        };
        nbLogger("_SdeNetworkEventListener.setCallback(), sdeParams=" + JSON.stringify(sdeParams));
        return sde.smt.common.exIfExecute("NebulaNetworkEventManager", "setNetworkEventListener", sdeParams);
    };
    _SdeNetworkEventListener.onNetworkStateChanged = function (params) {
        try {
            nbLogger("_SdeNetworkEventListener.onNetworkStateChanged(), params=" + JSON.stringify(params));
            if (this._callback != null && this._callback.onNetworkStateChanged != null) {
                if (params.isOnline != null) {
                    this._callback.onNetworkStateChanged(params.isOnline);
                }
                else {
                    nbError("_SdeNetworkEventListener.onNetworkStateChanged(), invalid parameters");
                }
            }
            else {
                nbLogger("_SdeNetworkEventListener.onNetworkStateChanged(), no callback");
            }
        }
        catch (e) {
            nbError("_SdeNetworkEventListener.onNetworkStateChanged(), exception=" + e);
        }
    };
    return _SdeNetworkEventListener;
}());
var _SdeSyncEventListener = (function () {
    function _SdeSyncEventListener() {
    }
    _SdeSyncEventListener.setListener = function (bucket, listener) {
        if (bucket == null) {
            nbError("_SdeSyncEventListener.setCallback(), no bucket");
            return;
        }
        nbLogger("_SdeSyncEventListener.setCallback(), before : _listeners=" + JSON.stringify(this._listeners));
        var bucketName = bucket.getBucketName();
        var bucketMode = bucket.getBucketMode();
        if (listener == null) {
            this._listeners[bucketName] = listener;
            this._bucketMode[bucketName] = bucketMode;
        }
        else {
            if (this._listeners[bucketName] != null) {
                delete this._listeners[bucketName];
            }
            if (this._bucketMode[bucketName] != null) {
                delete this._bucketMode[bucketName];
            }
        }
        nbLogger("_SdeSyncEventListener.setCallback(), after  : _listeners=" + JSON.stringify(this._listeners));
        var data = {};
        data.bucketName = bucketName;
        data.bucketMode = bucketMode;
        if (listener) {
            data.set = true;
        }
        else {
            data.set = false;
        }
        var sdeParams = {
            params: JSON.stringify(data),
            callback: ""
        };
        nbLogger("_SyncEventListener.setCallback(), sdeParams=" + JSON.stringify(sdeParams));
        return sde.smt.common.exIfExecute("NebulaSyncEventManager", "setSyncEventListener", sdeParams);
    };
    _SdeSyncEventListener.resolveConflict = function (data) {
        nbLogger("_SyncEventListener.resolveConflict(), data=" + data);
        var sdeParams = {
            params: JSON.stringify(data),
            callback: ""
        };
        nbLogger("_SyncEventListener.resolveConflict(), sdeParams=" + JSON.stringify(sdeParams));
        return sde.smt.common.exIfExecute("NebulaSyncEventManager", "resolveConflict", sdeParams);
    };
    _SdeSyncEventListener.onSyncStart = function (params) {
        try {
            nbLogger("_SdeSyncEventListener.onSyncStart(), params=" + JSON.stringify(params));
            if (params.bucketName != null) {
                var bucketName = params.bucketName;
                var listener = _SdeSyncEventListener._listeners[bucketName];
                if (listener && listener.onSyncStart) {
                    listener.onSyncStart(bucketName);
                }
                else {
                    nbLogger("_SdeSyncEventListener.onSyncStart(), no callback or onSyncStart");
                }
            }
            else {
                nbLogger("_SdeSyncEventListener.onSyncStart(), no bucketName");
            }
        }
        catch (e) {
            nbLogger("_SdeSyncEventListener.onSyncStart(), exception=" + e);
        }
    };
    _SdeSyncEventListener.onSyncCompleted = function (params) {
        try {
            nbLogger("_SdeSyncEventListener.onSyncCompleted(), params=" + JSON.stringify(params));
            nbLogger("_SdeSyncEventListener.onSyncCompleted(), bucketName=" + params.bucketName);
            nbLogger("_SdeSyncEventListener.onSyncCompleted(), objectIds=" + params.objectIds);
            if (params.bucketName != null && params.objectIds != null) {
                var bucketName = params.bucketName;
                var listener = _SdeSyncEventListener._listeners[bucketName];
                if (listener && listener.onSyncCompleted) {
                    listener.onSyncCompleted(bucketName, params.objectIds);
                }
                else {
                    nbLogger("_SdeSyncEventListener.onSyncCompleted(), no callback or onSyncCompleted");
                }
            }
            else {
                nbLogger("_SdeSyncEventListener.onSyncCompleted(), no bucketName or objectIds");
            }
        }
        catch (e) {
            nbLogger("_SdeSyncEventListener.onSyncCompleted(), exception=" + e);
        }
    };
    _SdeSyncEventListener.onSyncConflicted = function (params) {
        try {
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), params=" + JSON.stringify(params));
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), bucketName=" + params.bucketName);
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), resolveId=" + params.resolveId);
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), client=" + params.client);
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), server=" + params.server);
            if (params.bucketName != null && params.resolveId != null && params.client != null && params.server != null) {
                var bucketName = params.bucketName;
                var bucketMode = this._bucketMode[bucketName];
                if (!(bucketMode != null)) {
                    bucketMode = Nebula.BUCKET_MODE_REPLICA;
                }
                var listener = this._listeners[bucketName];
                if (listener && listener.onSyncConflicted) {
                    var bucket = new Nebula.ObjectBucket(bucketName, bucketMode);
                    bucket._setResolveId(params.resolveId);
                    listener.onSyncConflicted(bucket, params.client, params.server);
                }
                else {
                    nbLogger("_SdeSyncEventListener.onSyncConflicted(), no callback or onSyncCompleted");
                }
            }
            else {
                nbLogger("_SdeSyncEventListener.onSyncConflicted(), invalid parameters");
            }
        }
        catch (e) {
            nbLogger("_SdeSyncEventListener.onSyncConflicted(), exception=" + e);
        }
    };
    _SdeSyncEventListener.onResolveConflict = function (params) {
        try {
            nbLogger("_SdeSyncEventListener.onResolveConflict(), params=" + JSON.stringify(params));
            nbLogger("_SdeSyncEventListener.onResolveConflict(), resolve=" + params.resolve);
            nbLogger("_SdeSyncEventListener.onResolveConflict(), object=" + params.object);
            if (params.bucketName != null && params.resolve != null && params.object != null) {
                var bucketName = params.bucketName;
                var listener = _SdeSyncEventListener._listeners[bucketName];
                if (listener && listener["onResolveConflict"]) {
                    listener.onResolveConflict(params.object, params.resolve);
                }
                else {
                    nbLogger("Nebula._SdeSyncEventListener.onResolveConflict(), no callback or onResolveConflict");
                }
            }
            else {
                nbLogger("_SdeSyncEventListener.onSyncConflicted(), invalid parameters");
            }
        }
        catch (e) {
            nbLogger("_SdeSyncEventListener.onResolveConflict(), exception=" + e);
        }
    };
    _SdeSyncEventListener.onSyncError = function (params) {
        try {
            nbLogger("_SdeSyncEventListener.onSyncError(), params=" + JSON.stringify(params));
            nbLogger("_SdeSyncEventListener.onSyncError(), errorCode=" + params.errorCode);
            nbLogger("_SdeSyncEventListener.onSyncError(), object=" + params.object);
            if (params.bucketName != null && params.errorCode != null && params.object != null) {
                var bucketName = params.bucketName;
                var listener = _SdeSyncEventListener._listeners[bucketName];
                if (listener != null && listener.onSyncError != null) {
                    listener.onSyncError(params.errorCode, params.object);
                }
                else {
                    nbLogger("_SdeSyncEventListener.onSyncError(), no callback or onSyncError");
                }
            }
            else {
                nbLogger("_SdeSyncEventListener.onSyncError(), invalid parameters");
            }
        }
        catch (e) {
            nbLogger("_SdeSyncEventListener.onSyncError(), exception=" + e);
        }
    };
    _SdeSyncEventListener._listeners = {};
    _SdeSyncEventListener._bucketMode = {};
    return _SdeSyncEventListener;
}());
var AccountLink = (function () {
    function AccountLink() {
    }
    Object.defineProperty(AccountLink.prototype, "_id", {
        get: function () { return this.__id; },
        set: function (value) { this.__id = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccountLink.prototype, "iss", {
        get: function () { return this._iss; },
        set: function (value) { this._iss = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccountLink.prototype, "sub", {
        get: function () { return this._sub; },
        set: function (value) { this._sub = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccountLink.prototype, "op", {
        get: function () { return this._op; },
        set: function (value) { this._op = value; },
        enumerable: true,
        configurable: true
    });
    AccountLink.prototype._setAccountLink = function (obj) {
        if (obj._id != null) {
            this.__id = obj._id;
        }
        if (obj.iss != null) {
            this._iss = obj.iss;
        }
        if (obj.sub != null) {
            this._sub = obj.sub;
        }
        if (obj.op != null) {
            this._op = obj.op;
        }
        return this;
    };
    return AccountLink;
}());
var AclPermission = {
    READ: "r",
    WRITE: "w",
    CREATE: "c",
    UPDATE: "u",
    DELETE: "d",
    ADMIN: "admin",
    OWNER: "owner"
};
var AclGroup = {
    AUTHENTICATED: "g:authenticated",
    ANONYMOUS: "g:anonymous"
};
var Acl = (function () {
    function Acl(json) {
        nbLogger("Acl(), json=" + json);
        this._acl = {
            r: [],
            w: [],
            c: [],
            u: [],
            d: [],
            admin: []
        };
        if (json) {
            if (json[Acl.OWNER])
                this._acl[Acl.OWNER] = json[Acl.OWNER];
            if (json[Acl.READ])
                this._acl[Acl.READ] = json[Acl.READ];
            if (json[Acl.WRITE])
                this._acl[Acl.WRITE] = json[Acl.WRITE];
            if (json[Acl.CREATE])
                this._acl[Acl.CREATE] = json[Acl.CREATE];
            if (json[Acl.UPDATE])
                this._acl[Acl.UPDATE] = json[Acl.UPDATE];
            if (json[Acl.DELETE])
                this._acl[Acl.DELETE] = json[Acl.DELETE];
            if (json[Acl.ADMIN])
                this._acl[Acl.ADMIN] = json[Acl.ADMIN];
        }
    }
    Acl.prototype.addEntry = function (permission, entry) {
        var entries = this._acl[permission];
        if (!entries) {
            return false;
        }
        if (!entry) {
            return false;
        }
        var add = null;
        if (entry instanceof UserBase) {
            add = entry.get("_id");
        }
        else if (entry instanceof GroupBase) {
            add = "g:" + entry.get("groupname");
        }
        else {
            add = entry;
        }
        var exist = false;
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var target = entries_1[_i];
            if (target === add) {
                exist = true;
                break;
            }
        }
        if (!exist) {
            entries.push(add);
            nbLogger("Acl.addEntry(), added entry=" + add);
            return true;
        }
        return false;
    };
    Acl.prototype.removeEntry = function (permission, entry) {
        var entries = this._acl[permission];
        if (!entries) {
            return false;
        }
        if (!entry) {
            return false;
        }
        var remove = null;
        if (entry instanceof UserBase) {
            remove = entry.get("_id");
        }
        else if (entry instanceof GroupBase) {
            remove = "g:" + entry.get("groupname");
        }
        else {
            remove = entry;
        }
        for (var i = 0; i < entries.length; i++) {
            var target = entries[i];
            if (target === remove) {
                entries.splice(i, 1);
                nbLogger("Acl.removeEntry(), removed entry=" + remove);
                break;
            }
        }
    };
    Acl.prototype._setOwner = function (owner) {
        this._acl[Acl.OWNER] = owner;
    };
    Acl.prototype.getOwner = function () {
        if (this._acl[Acl.OWNER]) {
            return this._acl[Acl.OWNER];
        }
        return null;
    };
    Acl.prototype.getEntries = function (permission) {
        var entries = this._acl[permission];
        if (!entries) {
            return null;
        }
        return entries;
    };
    Acl.prototype._set = function (acl) {
        this._acl = acl;
    };
    Acl.prototype._hasEntry = function (permission, target) {
        var entries = this._acl[permission];
        if (entries) {
            for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                var entry = entries_2[_i];
                if (entry === target) {
                    return true;
                }
            }
        }
        return false;
    };
    Acl.prototype._toString = function (keyName) {
        return JSON.stringify(this._toJsonObject(keyName));
    };
    Acl.prototype._toJsonObject = function (keyName) {
        if (keyName === "ACL" || keyName === "contentACL") {
            var json = {};
            json[keyName] = this._acl;
            return json;
        }
        else {
            return this._acl;
        }
    };
    Acl.READ = "r";
    Acl.WRITE = "w";
    Acl.CREATE = "c";
    Acl.UPDATE = "u";
    Acl.DELETE = "d";
    Acl.ADMIN = "admin";
    Acl.OWNER = "owner";
    Acl.AUTHENTICATED = "g:authenticated";
    Acl.ANONYMOUS = "g:anonymous";
    return Acl;
}());
var RegexOption = {
    CASE_INSENSITIVITY: "i"
};
var Clause = (function () {
    function Clause(clause) {
        if (clause != null) {
            this._clause = clause;
        }
        else {
            this._clause = {};
        }
    }
    Clause.prototype._setParams = function (key, operator, value, options) {
        if (operator === null) {
            this._clause[key] = value;
        }
        else {
            var data = {};
            if (_isObject(this._clause[key])) {
                data = this._clause[key];
            }
            data[operator] = value;
            if (options) {
                data["$options"] = options;
            }
            this._clause[key] = data;
        }
        return this;
    };
    Clause.prototype.json = function () {
        return this._clause;
    };
    Clause.equals = function (key, value) {
        return new Clause().equals(key, value);
    };
    Clause.prototype.equals = function (key, value) {
        var operator = null;
        if (value != null && _isObject(value)) {
            operator = "$eq";
        }
        return this._setParams(key, operator, value);
    };
    Clause.notEquals = function (key, value) {
        return new Clause().notEquals(key, value);
    };
    Clause.prototype.notEquals = function (key, value) {
        return this._setParams(key, "$ne", value);
    };
    Clause.lessThan = function (key, value) {
        return new Clause().lessThan(key, value);
    };
    Clause.prototype.lessThan = function (key, value) {
        return this._setParams(key, "$lt", value);
    };
    Clause.lessThanOrEqual = function (key, value) {
        return new Clause().lessThanOrEqual(key, value);
    };
    Clause.prototype.lessThanOrEqual = function (key, value) {
        return this._setParams(key, "$lte", value);
    };
    Clause.greaterThan = function (key, value) {
        return new Clause().greaterThan(key, value);
    };
    Clause.prototype.greaterThan = function (key, value) {
        return this._setParams(key, "$gt", value);
    };
    Clause.greaterThanOrEqual = function (key, value) {
        return new Clause().greaterThanOrEqual(key, value);
    };
    Clause.prototype.greaterThanOrEqual = function (key, value) {
        return this._setParams(key, "$gte", value);
    };
    Clause.in = function (key, values) {
        return new Clause().in(key, values);
    };
    Clause.prototype.in = function (key, values) {
        return this._setParams(key, "$in", values);
    };
    Clause.all = function (key, values) {
        return new Clause().all(key, values);
    };
    Clause.prototype.all = function (key, values) {
        return this._setParams(key, "$all", values);
    };
    Clause.exist = function (key, value) {
        return new Clause().exist(key, value);
    };
    Clause.prototype.exist = function (key, value) {
        if (typeof value === "boolean") {
            return this._setParams(key, "$exists", value);
        }
        throw "exist: value is not boolean";
    };
    Clause.regex = function (key, expression, option) {
        return new Clause().regex(key, expression, option);
    };
    Clause.prototype.regex = function (key, expression, option) {
        return this._setParams(key, "$regex", expression, option);
    };
    Clause.prototype.not = function (key) {
        var data;
        if (this._clause === null || !(this._clause[key] != null)) {
            return null;
        }
        else if (_isObject(this._clause[key])) {
            data = {
                "$not": this._clause[key]
            };
            this._clause[key] = data;
        }
        else {
            data = {
                "$not": {
                    "$eq": this._clause[key]
                }
            };
            this._clause[key] = data;
        }
        return this;
    };
    Clause.and = function () {
        var clauses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            clauses[_i] = arguments[_i];
        }
        var values = Clause._convertClauseArray(clauses);
        return new Clause()._setParams("$and", null, values);
    };
    Clause.or = function () {
        var clauses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            clauses[_i] = arguments[_i];
        }
        var values = Clause._convertClauseArray(clauses);
        return new Clause()._setParams("$or", null, values);
    };
    Clause._convertClauseArray = function (clauseArray) {
        var values = [];
        for (var _i = 0, clauseArray_1 = clauseArray; _i < clauseArray_1.length; _i++) {
            var clause = clauseArray_1[_i];
            var value = clause.json();
            if (value != null) {
                values.push(value);
            }
        }
        return values;
    };
    return Clause;
}());
var ObjectQuery = (function () {
    function ObjectQuery() {
        this._clause = null;
        this._limit = -1;
        this._skip = 0;
        this._sort = [];
        this._deleteMark = false;
        this._countQuery = false;
        this._projection = null;
    }
    ObjectQuery.prototype.getClause = function () {
        return this._clause;
    };
    ObjectQuery.prototype.getLimit = function () {
        return this._limit;
    };
    ObjectQuery.prototype.getSkipCount = function () {
        return this._skip;
    };
    ObjectQuery.prototype.getSort = function () {
        return this._sort;
    };
    ObjectQuery.prototype.getSortOrder = function () {
        var result = [];
        for (var i = 0; i < this._sort.length; i++) {
            var key = this._sort[i];
            var e = {};
            if (key.match(/^-/)) {
                e[key.substr(1)] = false;
            }
            else {
                e[key] = true;
            }
            result.push(e);
        }
        return result;
    };
    ObjectQuery.prototype._getDeleteMark = function () {
        return this._deleteMark;
    };
    ObjectQuery.prototype.getProjection = function () {
        return this._projection;
    };
    ObjectQuery.prototype._setDeleteMark = function (mark) {
        if (typeof mark === "boolean") {
            nbLogger("ObjectQuery._setDeleteMark(), mark=" + mark + ", cur=" + this._deleteMark);
            this._deleteMark = mark;
        }
        else {
            throw new Error("deleteMark must be boolean");
        }
    };
    ObjectQuery.prototype._toParam = function () {
        var json = this._toParamJson();
        if (json.where) {
            json.where = JSON.stringify(json.where);
        }
        if (json.projection) {
            json.projection = JSON.stringify(json.projection);
        }
        return json;
    };
    ObjectQuery.prototype._toParamJson = function () {
        var json = {};
        if (this._clause) {
            json.where = this._clause.json();
        }
        if (this._sort.length > 0) {
            json.order = this._sort.join(",");
        }
        json.skip = this._skip;
        json.limit = this._limit;
        if (this._countQuery) {
            json.count = 1;
        }
        if (this._deleteMark) {
            json.deleteMark = 1;
        }
        if (this._projection) {
            json.projection = this._projection;
        }
        return json;
    };
    ObjectQuery._toObjectQuery = function (queryJson) {
        var query = new ObjectQuery();
        nbLogger("ObjectQuery._toObjectQuery(), queryJson=" + JSON.stringify(queryJson));
        if (queryJson["limit"] != null) {
            query.setLimit(queryJson["limit"]);
        }
        if (queryJson["skip"] != null) {
            query.setSkipCount(queryJson["skip"]);
        }
        var sort = queryJson["sort"];
        if (sort != null) {
            for (var _i = 0, _a = Object.keys(sort); _i < _a.length; _i++) {
                var sortKey = _a[_i];
                query.setSortOrder(sortKey, sort[sortKey]);
            }
        }
        var clause = queryJson["clause"];
        if (clause != null && Object.keys(clause).length !== 0) {
            query.setClause(new Clause(clause));
        }
        if (queryJson["deleteMark"] != null) {
            query._setDeleteMark(queryJson["deleteMark"]);
        }
        if (queryJson["countQuery"] != null) {
            query._setCountQuery(queryJson["countQuery"]);
        }
        return query;
    };
    ObjectQuery.prototype._equals = function (that) {
        if (this._limit !== that.getLimit()) {
            return false;
        }
        if (this._skip !== that.getSkipCount()) {
            return false;
        }
        if (this._deleteMark !== that._getDeleteMark()) {
            return false;
        }
        if (this._countQuery !== that._isCountQuery()) {
            return false;
        }
        if (this._projection) {
            if (that.getProjection()) {
                if (!_compareObject(this._projection, that.getProjection())) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            if (that.getProjection()) {
                return false;
            }
        }
        if (this._clause) {
            if (that.getClause()) {
                if (!_compareObject(this._clause.json(), that.getClause().json())) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            if (that.getClause()) {
                return false;
            }
        }
        return _compareObject(this._sort, that.getSortOrder());
    };
    ObjectQuery.prototype.setClause = function (clause) {
        if (clause === null || clause instanceof Clause) {
            this._clause = clause;
        }
        else {
            throw new Error("clause must be instanceof Nebula.Clause or null");
        }
        return this;
    };
    ObjectQuery.prototype.setLimit = function (limit) {
        if (limit >= -1) {
            this._limit = limit;
        }
        else {
            throw new Error("Invalid limit range");
        }
        return this;
    };
    ObjectQuery.prototype.setSkipCount = function (skip) {
        if (skip >= 0) {
            this._skip = skip;
        }
        else {
            throw new Error("Invalid skip range");
        }
        return this;
    };
    ObjectQuery.prototype.setSort = function (sort) {
        this._sort = sort;
        return this;
    };
    ObjectQuery.prototype.setSortOrder = function (key, isAsc) {
        if (!key) {
            throw new Error("No key");
        }
        if (typeof isAsc !== "boolean") {
            throw new Error("isAsc must be boolean");
        }
        if (isAsc) {
            this._sort.push(key);
        }
        else {
            this._sort.push("-" + key);
        }
        return this;
    };
    ObjectQuery.prototype.clearSortOrder = function (key) {
        if (key === void 0) { key = null; }
        if (!key) {
            this._sort = [];
        }
        else {
            for (var i = 0; i < this._sort.length; i++) {
                var k = this._sort[i];
                if (k === key || k === "-" + key) {
                    this._sort.splice(i, 1);
                    break;
                }
            }
        }
        return this;
    };
    ObjectQuery.prototype._setCountQuery = function (countQuery) {
        if (typeof countQuery === "boolean") {
            this._countQuery = countQuery;
        }
        else {
            throw new Error("countQuery must be boolean");
        }
        return this;
    };
    ObjectQuery.prototype._isCountQuery = function () {
        return this._countQuery;
    };
    ObjectQuery.prototype.setProjection = function (projectionJson) {
        if (projectionJson && _isObject(projectionJson)) {
            this._projection = projectionJson;
        }
        else if (projectionJson === null) {
            this._projection = null;
        }
        else {
            throw new Error("projection must be object or null");
        }
        return this;
    };
    return ObjectQuery;
}());
var UserBase = (function () {
    function UserBase(service) {
        this._service = service;
        this.__id = null;
        this._username = null;
        this._email = null;
        this._password = null;
        this._options = null;
        this._groups = null;
        this._createdAt = null;
        this._updatedAt = null;
        this._sessionToken = null;
        this._expire = null;
        this._clientCertUser = null;
        this._federated = false;
        this._primaryLinkedUserId = null;
    }
    Object.defineProperty(UserBase.prototype, "_id", {
        get: function () { return this.__id; },
        set: function (value) { this.__id = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "username", {
        get: function () { return this._username; },
        set: function (value) { this._username = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "email", {
        get: function () { return this._email; },
        set: function (value) { this._email = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "password", {
        get: function () { return this._password; },
        set: function (value) { this._password = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "options", {
        get: function () { return this._options; },
        set: function (value) { this._options = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "groups", {
        get: function () { return this._groups; },
        set: function (value) { this._groups = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "createdAt", {
        get: function () { return this._createdAt; },
        set: function (value) { this._createdAt = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "updatedAt", {
        get: function () { return this._updatedAt; },
        set: function (value) { this._updatedAt = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "sessionToken", {
        get: function () { return this._sessionToken; },
        set: function (value) { this._sessionToken = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "expire", {
        get: function () { return this._expire; },
        set: function (value) { this._expire = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "clientCertUser", {
        get: function () { return this._clientCertUser; },
        set: function (value) { this._clientCertUser = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "federated", {
        get: function () { return this._federated; },
        set: function (value) { this._federated = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserBase.prototype, "primaryLinkedUserId", {
        get: function () { return this._primaryLinkedUserId; },
        set: function (value) { this._primaryLinkedUserId = value; },
        enumerable: true,
        configurable: true
    });
    UserBase.prototype._setUserInfo = function (response) {
        nbLogger("User._setUserInfo#start");
        var jsonObj;
        try {
            jsonObj = JSON.parse(response);
        }
        catch (undefined) {
            nbError("User._setUserInfo#json error.");
            jsonObj = null;
        }
        if (jsonObj !== null) {
            if (jsonObj._id !== undefined) {
                this._id = jsonObj._id;
            }
            if (jsonObj.username !== undefined) {
                this.username = jsonObj.username;
            }
            if (jsonObj.email !== undefined) {
                this.email = jsonObj.email;
            }
            if (jsonObj.password !== undefined) {
                this.password = jsonObj.password;
            }
            if (jsonObj.options !== undefined) {
                this.options = jsonObj.options;
            }
            if (jsonObj.groups !== undefined) {
                this.groups = jsonObj.groups;
            }
            if (jsonObj.createdAt !== undefined) {
                this.createdAt = jsonObj.createdAt;
            }
            if (jsonObj.updatedAt !== undefined) {
                this.updatedAt = jsonObj.updatedAt;
            }
            if (jsonObj.sessionToken !== undefined) {
                this.sessionToken = jsonObj.sessionToken;
            }
            if (jsonObj.expire !== undefined) {
                this.expire = jsonObj.expire;
            }
            if (jsonObj.clientCertUser !== undefined) {
                this.clientCertUser = jsonObj.clientCertUser;
            }
            if (jsonObj.federated !== undefined) {
                this.federated = jsonObj.federated;
            }
            if (jsonObj.primaryLinkedUserId !== undefined) {
                this.primaryLinkedUserId = jsonObj.primaryLinkedUserId;
            }
        }
    };
    UserBase.prototype.set = function (property, value) {
        switch (property) {
            case "_id":
                this._id = value;
                break;
            case "username":
                this.username = value;
                break;
            case "email":
                this.email = value;
                break;
            case "password":
                this.password = value;
                break;
            case "options":
                this.options = value;
                break;
            case "createdAt":
                this.createdAt = value;
                break;
            case "updatedAt":
                this._updatedAt = value;
                break;
            case "sessionToken":
                this.sessionToken = value;
                break;
            case "expire":
                this.expire = value;
                break;
            case "clientCertUser":
                this.clientCertUser = value;
                break;
            case "federated":
                this.federated = value;
                break;
            case "primaryLinkedUserId":
                this.primaryLinkedUserId = value;
                break;
            default:
                nbError("Invalid property: " + property);
                throw new Error("Invalid property: " + property);
        }
    };
    UserBase.prototype.get = function (property) {
        switch (property) {
            case "_id":
                return this._id;
            case "username":
                return this.username;
            case "email":
                return this.email;
            case "password":
                return this.password;
            case "options":
                return this.options;
            case "groups":
                return this.groups;
            case "createdAt":
                return this.createdAt;
            case "updatedAt":
                return this.updatedAt;
            case "sessionToken":
                return this.sessionToken;
            case "expire":
                return this.expire;
            case "clientCertUser":
                return this.clientCertUser;
            case "federated":
                return this.federated;
            case "primaryLinkedUserId":
                return this.primaryLinkedUserId;
            default:
                nbError("Invalid property");
                throw new Error("Invalid property name");
        }
    };
    UserBase.prototype.register = function (callbacks) {
        var _this = this;
        nbLogger("User.register#start");
        var request;
        if (this._service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "register");
        }
        else {
            var path = "/users";
            nbLogger("User.register#REST API Request path = " + path);
            request = new HttpRequest(this._service, path);
            request.setMethod("POST");
            request.setContentType("application/json");
        }
        var registerParams;
        if (this.clientCertUser === true) {
            registerParams = {
                clientCertUser: true,
                username: this.username
            };
        }
        else {
            registerParams = {
                email: this.email,
                password: this.password
            };
            if (this.username != null) {
                registerParams.username = this.username;
            }
        }
        if (this.options !== null) {
            registerParams.options = this.options;
        }
        request.setData(registerParams);
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.register#success callback start");
            nbLogger("User.register#response = " + response);
            _this._setUserInfo(response);
            return _this;
        })
            .catch(function (error) {
            nbLogger("User.register#error callback start");
            nbLogger(("User.register#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.register#end");
        return _promisify(promise, callbacks);
    };
    UserBase._login = function (service, userInfo, callbacks) {
        nbLogger("User.login#start");
        if (userInfo == null || (userInfo.email == null && userInfo.username == null && userInfo.token == null)) {
            throw new Error("User.login: No username nor email nor token");
        }
        if (userInfo.password == null && userInfo.token == null) {
            throw new Error("User.login: No password nor token");
        }
        var request;
        if (service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "login");
        }
        else {
            var path = "/login";
            nbLogger("User.login#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setSessionToken(null);
            request.setMethod("POST");
            request.setContentType("application/json");
        }
        request.setData(userInfo);
        var user = new service.User();
        user.email = userInfo.email;
        user.username = userInfo.username;
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.login#success callback start");
            nbLogger("User.login#response = " + response);
            user._setUserInfo(response);
            service.setCurrentUser(user);
            return user;
        })
            .catch(function (error) {
            nbLogger("User.login#error callback start");
            nbLogger(("User.login#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.login#end");
        return _promisify(promise, callbacks);
    };
    UserBase._logout = function (service, callbacks) {
        nbLogger("User.logout#start");
        var request;
        if (service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "logout");
        }
        else {
            var path = "/login";
            nbLogger("User.logout#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setMethod("DELETE");
            request.setContentType("application/json");
        }
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.logout#success callback start");
            nbLogger("User.logout#response = " + response);
            service.removeCurrentUser();
            return;
        })
            .catch(function (error) {
            nbLogger("User.logout#error callback start");
            nbLogger(("User.logout#error = " + (_errorText(error))));
            service.removeCurrentUser();
            return Promise.reject(error);
        });
        nbLogger("User.logout#end");
        return _promisify(promise, callbacks);
    };
    UserBase._current = function (service, callbacks) {
        var user = null;
        var _currentObj = service.getCurrentUser();
        if (_currentObj !== null) {
            user = new service.User();
            user._setUserInfo(JSON.stringify(_currentObj));
        }
        if (callbacks && callbacks.success) {
            callbacks.success(user);
        }
        return user;
    };
    UserBase._saveCurrent = function (service, userInfo) {
        if (service.isOffline()) {
            throw new Error("Not supported in offline mode");
        }
        if ((userInfo === null)) {
            service.removeCurrentUser();
        }
        else {
            var newInfo = service.getCurrentUser() || {};
            for (var key in userInfo) {
                if (userInfo.hasOwnProperty(key)) {
                    newInfo[key] = userInfo[key];
                }
            }
            var user = new service.User();
            user._setUserInfo(JSON.stringify(newInfo));
            service.setCurrentUser(user);
        }
    };
    UserBase._queryCurrent = function (service, callbacks) {
        nbLogger("User.queryCurrent#start");
        var request;
        if (service.isOffline()) {
            var _currentObj = service.getCurrentUser();
            if (_currentObj === null) {
                return _promisify(Promise.resolve(null), callbacks);
            }
            request = new _SdeRequest("NebulaUser", "current");
        }
        else {
            var path = "/users/current";
            nbLogger("User.queryCurrent#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setMethod("GET");
            request.setContentType("application/json");
        }
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.queryCurrent#success callback start");
            nbLogger("User.queryCurrent#response = " + response);
            var user = new service.User();
            user._setUserInfo(response);
            return user;
        })
            .catch(function (error) {
            nbLogger("User.queryCurrent#error callback start");
            nbLogger(("User.queryCurrent#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.queryCurrent#end");
        return _promisify(promise, callbacks);
    };
    UserBase._query = function (service, conditions, callbacks) {
        nbLogger("User.query#start");
        var request;
        if (service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "query");
            if (conditions !== null) {
                request.setData(conditions);
            }
        }
        else {
            var path = "/users";
            var queryParams = {};
            if (conditions) {
                if (conditions._id) {
                    path = "/users/" + encodeURIComponent(conditions._id);
                }
                else if (conditions.email) {
                    queryParams.email = conditions.email;
                }
                else if (conditions.username) {
                    queryParams.username = conditions.username;
                }
                if (conditions.skip != null) {
                    queryParams.skip = conditions.skip;
                }
                if (conditions.limit != null) {
                    queryParams.limit = conditions.limit;
                }
            } 
            nbLogger("User.query#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setMethod("GET");
            request.setQueryParams(queryParams);
            request.setContentType("application/json");
        }
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.query#success callback start");
            nbLogger("User.query#response = " + response);
            var obj = JSON.parse(response);
            var objArray = [];
            var userArray = [];
            var i = 0;
            if (obj.results === undefined) {
                objArray.push(obj);
            }
            else {
                objArray = obj.results;
            }
            while (i < objArray.length) {
                var user = new service.User();
                user._setUserInfo(JSON.stringify(objArray[i]));
                userArray.push(user);
                i++;
            }
            if (conditions != null && conditions.countQuery) {
                return {
                    users: userArray,
                    count: obj.count
                };
            }
            else {
                return userArray;
            }
        })
            .catch(function (error) {
            nbLogger("User.query#error callback start");
            nbLogger(("User.query#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.query#end");
        return _promisify(promise, callbacks);
    };
    UserBase._update = function (service, user, callbacks) {
        if (!(user instanceof UserBase)) {
            throw new Error("User.update: not User instance");
        }
        if (user._service !== service) {
            throw new Error("Service does not match");
        }
        return user._update(callbacks);
    };
    UserBase.prototype._update = function (callbacks) {
        var _this = this;
        var path;
        var request;
        var error;
        nbLogger("User.update#start");
        if (this.get("_id") === null) {
            nbLogger("User.update: no user id");
            error = _createError(400, "Bad Request (local)", "no user id.");
            return _promisify(Promise.reject(error), callbacks);
        }
        var updateParams = {};
        if (this._service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "update");
            updateParams._id = this.get("_id");
        }
        else {
            path = "/users/" + this.get("_id");
            nbLogger("User.update#REST API Request path = " + path);
            request = new HttpRequest(this._service, path);
            request.setMethod("PUT");
            request.setContentType("application/json");
            delete updateParams._id;
        }
        if (this.get("email") !== null) {
            updateParams.email = this.get("email");
        }
        if (this.get("username") !== null) {
            updateParams.username = this.get("username");
        }
        if (this.get("password") !== null) {
            updateParams.password = this.get("password");
        }
        if (this.get("options") !== null) {
            updateParams.options = this.get("options");
        }
        request.setData(updateParams);
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.update#success callback start");
            nbLogger("User.update#response = " + response);
            _this._setUserInfo(response);
            return _this;
        })
            .catch(function (error) {
            nbLogger("User.update#error callback start");
            nbLogger(("User.update#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.update#end");
        return _promisify(promise, callbacks);
    };
    UserBase._remove = function (service, user, callbacks) {
        if (!(user instanceof UserBase)) {
            throw new Error("User.remove: not User instance");
        }
        if (user._service !== service) {
            throw new Error("User.remove: service does not match");
        }
        return user._remove(callbacks);
    };
    UserBase.prototype._remove = function (callbacks) {
        var _this = this;
        nbLogger("User.remove#start");
        if (this.get("_id") === null) {
            nbLogger("User.remove: no user id.");
            var error = _createError(400, "Bad argument (local)", "no user id.");
            return _promisify(Promise.reject(error), callbacks);
        }
        var request;
        if (this._service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "delete");
            request.setData({
                _id: this.get("_id")
            });
        }
        else {
            var path = "/users/" + this.get("_id");
            nbLogger("User.remove#REST API Request path = " + path);
            request = new HttpRequest(this._service, path);
            request.setMethod("DELETE");
        }
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.remove#success callback start");
            nbLogger("User.remove#response = " + response);
            var _currentUser = _this._service.getCurrentUser();
            if (_currentUser !== null) {
                if (_this.get("_id") === _currentUser._id) {
                    nbLogger("User.remove#delete user is current user");
                    _this._service.removeCurrentUser();
                }
            }
            return;
        })
            .catch(function (error) {
            nbLogger("User.remove#error callback start");
            nbLogger(("User.remove#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.remove#end");
        return _promisify(promise, callbacks);
    };
    UserBase._resetPassword = function (service, userInfo, callbacks) {
        nbLogger("User.resetPassword#start");
        if (userInfo == null || (userInfo.email == null && userInfo.username == null)) {
            throw new Error("User.resetPassword: bad arguments");
        }
        var request;
        if (service.isOffline()) {
            request = new _SdeRequest("NebulaUser", "resetPassword");
        }
        else {
            var path = "/request_password_reset";
            nbLogger("User.resetPassword#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setSessionToken(null);
            request.setMethod("POST");
            request.setContentType("application/json");
        }
        var resetParams;
        if (((userInfo.email !== undefined) && (userInfo.username !== undefined))) {
            resetParams = {
                email: userInfo.email,
                username: userInfo.username
            };
        }
        else if (((userInfo.email !== undefined) && (userInfo.username === undefined))) {
            resetParams = {
                email: userInfo.email
            };
        }
        else if (((userInfo.email === undefined) && (userInfo.username !== undefined))) {
            resetParams = {
                username: userInfo.username
            };
        }
        request.setData(resetParams);
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.resetPassword#success callback start");
            nbLogger("User.resetPassword#response = " + response);
            return;
        })
            .catch(function (error) {
            nbLogger("User.resetPassword#error callback start");
            nbLogger(("User.resetPassword#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.delete#end");
        return _promisify(promise, callbacks);
    };
    UserBase._getAccountLinks = function (service, user, callbacks) {
        if (!(user instanceof UserBase)) {
            throw new Error("User.getAccountLinks: not User instance");
        }
        if (user._service !== service) {
            throw new Error("User.getAccountLinks: Service does not match");
        }
        return user._getAccountLinks(callbacks);
    };
    UserBase.prototype._getAccountLinks = function (callbacks) {
        nbLogger("User.getAccountLinks#start");
        if (this._service.isOffline()) {
            throw new Error("User.getAccountLinks: offline mode is not supported");
        }
        if (this._id === null) {
            throw new Error("User.getAccountLinks: no user id");
        }
        var path = "/users/" + this._id + "/links";
        nbLogger("User.getAccountLinks#REST API Request path = " + path);
        var request = new HttpRequest(this._service, path);
        request.setMethod("GET");
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.getAccountLinks#response = " + response);
            var resObj = JSON.parse(response);
            var resArray = resObj.results;
            var links = [];
            if (resArray != null) {
                for (var _i = 0, resArray_1 = resArray; _i < resArray_1.length; _i++) {
                    var obj = resArray_1[_i];
                    var link = new AccountLink();
                    link._setAccountLink(obj);
                    links.push(link);
                }
            }
            return links;
        })
            .catch(function (error) {
            nbLogger(("User.getAccountLinks#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.getAccountLinks#end");
        return _promisify(promise, callbacks);
    };
    UserBase._deleteAccountLink = function (service, user, linkedUserId, callbacks) {
        if (!(user instanceof UserBase)) {
            throw new Error("User.deleteAccountLink: not User instance");
        }
        if (user._service !== service) {
            throw new Error("User.deleteAccountLink: Service does not match");
        }
        if (linkedUserId == null) {
            throw new Error("User.deleteAccountLink: no linkedUserId");
        }
        return user._deleteAccountLink(linkedUserId, callbacks);
    };
    UserBase.prototype._deleteAccountLink = function (linkedUserId, callbacks) {
        nbLogger("User.deleteAccountLink#start");
        if (this._service.isOffline()) {
            throw new Error("User.deleteAccountLink: offline mode is not supported");
        }
        if (this._id === null) {
            throw new Error("User.deleteAccountLink: no user id");
        }
        if (this.primaryLinkedUserId !== null && this.primaryLinkedUserId === linkedUserId) {
            throw new Error("User.deleteAccountLink: linkedUserId is primaryLinkedUserId");
        }
        var path = "/users/" + this._id + "/links/" + linkedUserId;
        nbLogger("User.deleteAccountLink#REST API Request path = " + path);
        var request = new HttpRequest(this._service, path);
        request.setMethod("DELETE");
        var promise = request.execute()
            .then(function (response) {
            nbLogger("User.deleteAccountLink#response = " + response);
            return;
        })
            .catch(function (error) {
            nbLogger(("User.deleteAccountLink#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("User.deleteAccountLink#end");
        return _promisify(promise, callbacks);
    };
    return UserBase;
}());
var declareUser = function (_service) {
    _service.User = (_a = (function (_super) {
            __extends(User, _super);
            function User() {
                var _this = _super.call(this, _service) || this;
                nbLogger("User.constructor");
                return _this;
            }
            User.prototype.set = function (property, value) {
                _super.prototype.set.call(this, property, value);
                return this;
            };
            User.prototype.get = function (property) {
                return _super.prototype.get.call(this, property);
            };
            User.prototype.register = function (callbacks) {
                return _super.prototype.register.call(this, callbacks);
            };
            User.login = function (userInfo, callbacks) {
                return _super._login.call(this, _service, userInfo, callbacks);
            };
            User.logout = function (callbacks) {
                return _super._logout.call(this, _service, callbacks);
            };
            User.current = function (callbacks) {
                return _super._current.call(this, _service, callbacks);
            };
            User.saveCurrent = function (userInfo) {
                _super._saveCurrent.call(this, _service, userInfo);
            };
            User.queryCurrent = function (callbacks) {
                return _super._queryCurrent.call(this, _service, callbacks);
            };
            User.query = function (conditions, callbacks) {
                return _super._query.call(this, _service, conditions, callbacks);
            };
            User.update = function (user, callbacks) {
                return _super._update.call(this, _service, user, callbacks);
            };
            User.remove = function (user, callbacks) {
                return _super._remove.call(this, _service, user, callbacks);
            };
            User.resetPassword = function (userInfo, callbacks) {
                return _super._resetPassword.call(this, _service, userInfo, callbacks);
            };
            User.getAccountLinks = function (user, callbacks) {
                return _super._getAccountLinks.call(this, _service, user, callbacks);
            };
            User.deleteAccountLink = function (user, linkedUserId, callbacks) {
                return _super._deleteAccountLink.call(this, _service, user, linkedUserId, callbacks);
            };
            return User;
        }(UserBase)),
        _a.delete = _a.remove,
        _a);
    var _a;
};
var GroupBase = (function () {
    function GroupBase(service, groupname) {
        this._service = service;
        this._id = null;
        this.groupname = null;
        this.users = [];
        this.groups = [];
        this.acl = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.etag = null;
        if (((typeof groupname) === "string") && groupname !== "") {
            this.groupname = groupname;
        }
    }
    Object.defineProperty(GroupBase.prototype, "_id", {
        get: function () { return this.__id; },
        set: function (value) { this.__id = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "groupname", {
        get: function () { return this._groupname; },
        set: function (value) { this._groupname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "users", {
        get: function () { return this._users; },
        set: function (value) { this._users = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "groups", {
        get: function () { return this._groups; },
        set: function (value) { this._groups = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "acl", {
        get: function () { return this._acl; },
        set: function (value) {
            if (value != null && !(value instanceof Acl)) {
                throw new Error("acl is not Acl instance!");
            }
            this._acl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "createdAt", {
        get: function () { return this._createdAt; },
        set: function (value) { this._createdAt = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "updatedAt", {
        get: function () { return this._updatedAt; },
        set: function (value) { this._updatedAt = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroupBase.prototype, "etag", {
        get: function () { return this._etag; },
        set: function (value) { this._etag = value; },
        enumerable: true,
        configurable: true
    });
    GroupBase.prototype._setGroupInfo = function (response) {
        var jsonObj;
        try {
            jsonObj = JSON.parse(response);
        }
        catch (undefined) {
            nbError("Group._setGroupInfo#json error.");
            return;
        }
        if (jsonObj._id !== undefined) {
            this._id = jsonObj._id;
        }
        if (jsonObj.name !== undefined) {
            this.groupname = jsonObj.name;
        }
        if (jsonObj.users !== undefined) {
            this.users = jsonObj.users;
        }
        if (jsonObj.groups !== undefined) {
            this.groups = jsonObj.groups;
        }
        if (jsonObj.ACL !== undefined) {
            this.acl = new Acl();
            this.acl._set(jsonObj.ACL);
            if (jsonObj.ACL[Acl.OWNER] !== undefined) {
                this.acl._setOwner(jsonObj.ACL[Acl.OWNER]);
            }
        }
        if (jsonObj.createdAt !== undefined) {
            this.createdAt = jsonObj.createdAt;
        }
        if (jsonObj.updatedAt !== undefined) {
            this.updatedAt = jsonObj.updatedAt;
        }
        if (jsonObj.etag !== undefined) {
            return this.etag = jsonObj.etag;
        }
    };
    GroupBase.prototype.set = function (property, value) {
        switch (property) {
            case "_id":
                this._id = value;
                break;
            case "groupname":
                this.groupname = value;
                break;
            case "users":
                this.users = value;
                break;
            case "groups":
                this.groups = value;
                break;
            case "acl":
                this.acl = value;
                break;
            case "createdAt":
                this.createdAt = value;
                break;
            case "updatedAt":
                this.updatedAt = value;
                break;
            case "etag":
                this.etag = value;
                break;
            default:
                nbError("Invalid property: " + property);
                throw new Error("Invalid property: " + property);
        }
    };
    GroupBase.prototype.get = function (property) {
        switch (property) {
            case "_id":
                return this._id;
            case "groupname":
                return this.groupname;
            case "users":
                return this.users;
            case "groups":
                return this.groups;
            case "acl":
                return this.acl;
            case "createdAt":
                return this.createdAt;
            case "updatedAt":
                return this.updatedAt;
            case "etag":
                return this.etag;
            default:
                nbError("Invalid property: " + property);
                throw new Error("Invalid property: " + property);
        }
    };
    GroupBase.prototype.addEntry = function (entry) {
        nbLogger("Group.addEntry#start");
        var _entries = [];
        var _add = null;
        if (entry instanceof this._service.User) {
            _add = entry.get("_id");
            _entries = this.users;
        }
        else if (entry instanceof this._service.Group) {
            _add = entry.get("groupname");
            _entries = this.groups;
        }
        else {
            throw new Error("Group.addEntry: Invalid entry");
        }
        var _exists = false;
        for (var _i = 0, _entries_1 = _entries; _i < _entries_1.length; _i++) {
            var _entry = _entries_1[_i];
            if (_entry === _add) {
                _exists = true;
            }
        }
        if (!_exists) {
            _entries.push(_add);
        }
        nbLogger("Group.addEntry#end");
        return true;
    };
    GroupBase.prototype.removeEntry = function (entry) {
        nbLogger("Group.removeEntry#start");
        var _entries = [];
        var _remove = null;
        if (entry instanceof this._service.User) {
            _remove = entry.get("_id");
            _entries = this.users;
        }
        else if (entry instanceof this._service.Group) {
            _remove = entry.get("groupname");
            _entries = this.groups;
        }
        else {
            throw new Error("Group.removeEntry: Invalid entry");
        }
        for (var i = 0; i < _entries.length; i++) {
            if (_entries[i] === _remove) {
                _entries.splice(i, 1);
                break;
            }
        }
        nbLogger("Group.removeEntry#end");
        return true;
    };
    GroupBase.prototype.save = function (callbacks) {
        var _this = this;
        nbLogger("Group.save#start");
        if (this.groupname == null) {
            throw new Error("Group.save: no group name");
        }
        var saveParams = {};
        var request;
        if (this._service.isOffline()) {
            request = new _SdeRequest("NebulaGroup", "save");
            saveParams.groupname = this.groupname;
            if (this.etag != null) {
                saveParams.etag = this.etag;
            }
        }
        else {
            var path = "/groups/" + encodeURIComponent(this.groupname);
            nbLogger("Group.save#REST API Request path = " + path);
            request = new HttpRequest(this._service, path);
            if (this.etag != null) {
                request.setQueryParam("etag", this.etag);
            }
            request.setMethod("PUT");
            request.setContentType("application/json");
        }
        saveParams.users = this.users;
        saveParams.groups = this.groups;
        if (this.acl !== null) {
            saveParams.ACL = this.acl._toJsonObject();
        }
        request.setData(saveParams);
        var promise = request.execute().then(function (response) {
            nbLogger("Group.save#success callback start");
            nbLogger("Group.save#response = " + response);
            _this._setGroupInfo(response);
            return _this;
        }).catch(function (error) {
            nbLogger("Group.save#error callback start");
            nbLogger(("Group.save#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("Group.save#end");
        return _promisify(promise, callbacks);
    };
    GroupBase.prototype.addMembers = function (userIds, groups, callbacks) {
        return this._addRemoveMembers("add", userIds, groups, callbacks);
    };
    GroupBase.prototype.removeMembers = function (userIds, groups, callbacks) {
        return this._addRemoveMembers("remove", userIds, groups, callbacks);
    };
    GroupBase.prototype._addRemoveMembers = function (mode, userIds, groups, callbacks) {
        var _this = this;
        nbLogger("Group." + mode + "Members#start");
        if (this.groupname == null) {
            throw new Error("No group name");
        }
        if (this._service.isOffline()) {
            throw new Error("offline mode is not supported.");
        }
        var path = "/groups/" + encodeURIComponent(this.groupname) + ("/" + mode + "Members");
        var request = new HttpRequest(this._service, path);
        request.setMethod("PUT");
        request.setContentType("application/json");
        var body = {
            users: userIds != null ? userIds : [],
            groups: groups != null ? groups : []
        };
        request.setData(body);
        var promise = request.execute().then(function (response) {
            nbLogger("Group." + mode + "Members#response = " + response);
            _this._setGroupInfo(response);
            return _this;
        }).catch(function (error) {
            nbLogger("Group." + mode + "Members#error = " + _errorText(error));
            return Promise.reject(error);
        });
        return _promisify(promise, callbacks);
    };
    GroupBase._remove = function (service, group, callbacks) {
        if (!(group instanceof GroupBase)) {
            throw new Error("Group.remove: not Group instance!");
        }
        if (group._service !== service) {
            throw new Error("Service does not match");
        }
        return group._remove(callbacks);
    };
    GroupBase.prototype._remove = function (callbacks) {
        nbLogger("Group.remove#start");
        var request;
        var deleteParams;
        if (this._service.isOffline()) {
            request = new _SdeRequest("NebulaGroup", "delete");
            deleteParams = {
                groupname: this.get("groupname")
            };
            var etag = this.get("etag");
            if (etag != null) {
                deleteParams.etag = etag;
            }
            request.setData(deleteParams);
        }
        else {
            var path = "/groups/" + encodeURIComponent(this.get("groupname"));
            nbLogger("Group.remove#REST API Request path = " + path);
            request = new HttpRequest(this._service, path);
            var etag = this.get("etag");
            if (etag != null) {
                request.setQueryParam("etag", etag);
            }
            request.setMethod("DELETE");
        }
        var promise = request.execute().then(function (response) {
            nbLogger("Group.remove#success callback start");
            nbLogger("Group.remove#response = " + response);
            return;
        }).catch(function (error) {
            nbLogger("Group.remove#error callback start");
            nbLogger(("Group.remove#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("Group.remove#end");
        return _promisify(promise, callbacks);
    };
    GroupBase._query = function (service, conditions, callbacks) {
        nbLogger("Group.query#start");
        var groupname = null;
        if (conditions != null) {
            if (conditions.groupname != null) {
                groupname = conditions.groupname;
            }
            else {
                throw new Error("Group.query: no groupname in conditions");
            }
        }
        var request;
        if (service.isOffline()) {
            request = new _SdeRequest("NebulaGroup", "query");
            if (groupname !== null) {
                request.setData({
                    groupname: groupname
                });
            }
        }
        else {
            var path = void 0;
            if (groupname !== null) {
                path = "/groups/" + encodeURIComponent(groupname);
            }
            else {
                path = "/groups";
            }
            nbLogger("Group.query#REST API Request path = " + path);
            request = new HttpRequest(service, path);
            request.setMethod("GET");
            request.setContentType("application/json");
        }
        var promise = request.execute().then(function (response) {
            nbLogger("Group.query#response = " + response);
            var obj = JSON.parse(response);
            var objArray = [];
            var groupArray = [];
            if (obj.results === undefined) {
                objArray.push(obj);
            }
            else {
                objArray = obj.results;
            }
            for (var _i = 0, objArray_1 = objArray; _i < objArray_1.length; _i++) {
                var obj_1 = objArray_1[_i];
                var group = new service.Group(obj_1.name);
                group._setGroupInfo(JSON.stringify(obj_1));
                groupArray.push(group);
            }
            return groupArray;
        }).catch(function (error) {
            nbLogger(("Group.query#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("Group.query#end");
        return _promisify(promise, callbacks);
    };
    return GroupBase;
}());
var declareGroup = function (_service) {
    _service.Group = (_a = (function (_super) {
            __extends(Group, _super);
            function Group(groupname) {
                var _this = _super.call(this, _service, groupname) || this;
                nbLogger("Group.constructor");
                return _this;
            }
            Group.prototype.set = function (property, value) {
                _super.prototype.set.call(this, property, value);
                return this;
            };
            Group.prototype.get = function (property) {
                return _super.prototype.get.call(this, property);
            };
            Group.prototype.addEntry = function (entry) {
                return _super.prototype.addEntry.call(this, entry);
            };
            Group.prototype.removeEntry = function (entry) {
                return _super.prototype.removeEntry.call(this, entry);
            };
            Group.prototype.save = function (callbacks) {
                return _super.prototype.save.call(this, callbacks);
            };
            Group.remove = function (group, callbacks) {
                return _super._remove.call(this, _service, group, callbacks);
            };
            Group.prototype.addMembers = function (userIds, groups, callbacks) {
                return _super.prototype.addMembers.call(this, userIds, groups, callbacks);
            };
            Group.prototype.removeMembers = function (userIds, groups, callbacks) {
                return _super.prototype.removeMembers.call(this, userIds, groups, callbacks);
            };
            Group.query = function (conditions, callbacks) {
                return _super._query.call(this, _service, conditions, callbacks);
            };
            return Group;
        }(GroupBase)),
        _a.delete = _a.remove,
        _a);
    var _a;
};
var FileMetadata = (function () {
    function FileMetadata() {
        this._createdAt = null;
        this._updatedAt = null;
        this._acl = null;
        this._contentType = null;
        this._publicUrl = null;
        this._fileName = null;
        this._fileSize = -1;
        this._syncState = FileMetadata.SYNC_STATE_UNDEFINED;
        this._lastSyncTime = null;
        this._metaId = null;
        this._metaETag = null;
        this._fileETag = null;
        this._options = null;
        this._cacheDisabled = false;
    }
    FileMetadata.prototype.getFileName = function () {
        return this._fileName;
    };
    FileMetadata.prototype.setFileName = function (fileName) {
        nbLogger("FileMetadata.setFileName(), " + this._fileName + " ---> " + fileName);
        this._fileName = fileName;
        return this;
    };
    FileMetadata.prototype.getAcl = function () {
        return this._acl;
    };
    FileMetadata.prototype.setAcl = function (acl) {
        if (acl != null && !(acl instanceof Acl)) {
            throw new Error("FileMetadata.setAcl: Not Acl instance!");
        }
        this._acl = acl;
        return this;
    };
    FileMetadata.prototype.getContentType = function () {
        return this._contentType;
    };
    FileMetadata.prototype.setContentType = function (contentType) {
        nbLogger("FileMetadata.setContentType(), " + this._contentType + " -> " + contentType);
        this._contentType = contentType;
        return this;
    };
    FileMetadata.prototype.getCreatedAt = function () {
        return this._createdAt;
    };
    FileMetadata.prototype._setCreatedAt = function (createdAt) {
        this._createdAt = createdAt;
        return this;
    };
    FileMetadata.prototype.getUpdatedAt = function () {
        return this._updatedAt;
    };
    FileMetadata.prototype._setUpdatedAt = function (updatedAt) {
        this._updatedAt = updatedAt;
        return this;
    };
    FileMetadata.prototype.getSize = function () {
        return this._fileSize;
    };
    FileMetadata.prototype._setSize = function (size) {
        this._fileSize = size;
        return this;
    };
    FileMetadata.prototype.getPublicUrl = function () {
        return this._publicUrl;
    };
    FileMetadata.prototype._setPublicUrl = function (url) {
        this._publicUrl = url;
        return this;
    };
    FileMetadata.prototype.getFileSyncState = function () {
        return this._syncState;
    };
    FileMetadata.prototype._setFileSyncState = function (syncState) {
        this._syncState = syncState;
        return this;
    };
    FileMetadata.prototype.getLastSyncTime = function () {
        return this._lastSyncTime;
    };
    FileMetadata.prototype._setLastSyncTime = function (lastSyncTime) {
        this._lastSyncTime = lastSyncTime;
        return this;
    };
    FileMetadata.prototype.getMetaId = function () {
        return this._metaId;
    };
    FileMetadata.prototype._setMetaId = function (metaId) {
        this._metaId = metaId;
        return this;
    };
    FileMetadata.prototype.getMetaETag = function () {
        return this._metaETag;
    };
    FileMetadata.prototype._setMetaETag = function (metaETag) {
        this._metaETag = metaETag;
        return this;
    };
    FileMetadata.prototype.getFileETag = function () {
        return this._fileETag;
    };
    FileMetadata.prototype._setFileETag = function (fileETag) {
        this._fileETag = fileETag;
        return this;
    };
    FileMetadata.prototype.getOptions = function () {
        return this._options;
    };
    FileMetadata.prototype.setOptions = function (options) {
        this._options = options;
        return this;
    };
    FileMetadata.prototype.isCacheDisabled = function () {
        return this._cacheDisabled;
    };
    FileMetadata.prototype.setCacheDisabled = function (cacheDisabled) {
        this._cacheDisabled = cacheDisabled;
        return this;
    };
    FileMetadata.prototype._setMetadata = function (obj) {
        if (obj.filename != null) {
            this.setFileName(obj.filename);
        }
        if (obj.contentType != null) {
            this.setContentType(obj.contentType);
        }
        if (obj.ACL != null) {
            var acl = new Acl(obj.ACL);
            this.setAcl(acl);
        }
        if (obj["length"] != null) {
            this._setSize(obj["length"]);
        }
        if (obj.publicUrl != null) {
            this._setPublicUrl(obj.publicUrl);
        }
        if (obj.createdAt != null) {
            this._setCreatedAt(obj.createdAt);
        }
        if (obj.updatedAt != null) {
            this._setUpdatedAt(obj.updatedAt);
        }
        if (obj.lastSyncTime != null) {
            this._setLastSyncTime(obj.lastSyncTime);
        }
        if (obj.metaId != null) {
            this._setMetaId(obj.metaId);
        }
        if (obj.metaETag != null) {
            this._setMetaETag(obj.metaETag);
        }
        if (obj.fileETag != null) {
            this._setFileETag(obj.fileETag);
        }
        if (obj.options != null) {
            this.setOptions(obj.options);
        }
        if (obj.cacheDisabled != null) {
            this.setCacheDisabled(obj.cacheDisabled);
        }
        if (obj.fileSyncState != null) {
            this._setFileSyncState(obj.fileSyncState);
        }
        return this;
    };
    FileMetadata.SYNC_STATE_UNDEFINED = -1;
    FileMetadata.SYNC_STATE_SYNCED = 0;
    FileMetadata.SYNC_STATE_DIRTY = 1;
    FileMetadata.SYNC_STATE_SYNCING = 3;
    FileMetadata.SYNC_STATE_CONFLICTED = 5;
    return FileMetadata;
}());
var BaseBucket = (function () {
    function BaseBucket(service, name, type, mode) {
        if (mode === void 0) { mode = Nebula.BUCKET_MODE_ONLINE; }
        this._service = service;
        this._type = type;
        this._name = name;
        this._acl = null;
        this._contentAcl = null;
        this._description = null;
        if (mode !== Nebula.BUCKET_MODE_ONLINE && mode !== Nebula.BUCKET_MODE_REPLICA && mode !== Nebula.BUCKET_MODE_LOCAL) {
            this._mode = Nebula.BUCKET_MODE_ONLINE;
        }
        else {
            this._mode = mode;
        }
    }
    BaseBucket._baseLoadBucket = function (type, service, name, mode, callbacks) {
        nbLogger("BaseBucket.loadBucket(), name=" + name + ", type=" + type + ", callbacks=" + callbacks + ", mode=" + mode);
        var req;
        if (service.isOffline()) {
            req = new _SdeRequest(BaseBucket.getClassName(type), "loadBucket");
            var body = {
                bucketName: name
            };
            if (mode !== Nebula.BUCKET_MODE_ONLINE && mode !== Nebula.BUCKET_MODE_REPLICA && mode !== Nebula.BUCKET_MODE_LOCAL) {
                mode = Nebula.BUCKET_MODE_ONLINE;
            }
            body.bucketMode = mode;
            req.setData(body);
        }
        else {
            var path = "/buckets/" + type + "/" + encodeURIComponent(name);
            req = new HttpRequest(service, path);
            req.setMethod("GET");
            req.setContentType("application/json");
        }
        var promise = req.execute().then(function (response) {
            try {
                nbLogger("BaseBucket.loadBucket(), success : " + response);
                var resObj = JSON.parse(response);
                var resName = resObj.name;
                if (resName == null) {
                    nbLogger("BaseBucket.loadBucket(), invalid bucket name, name=" + resName);
                    var error = _createError(0, "Invalid response", "", name);
                    return Promise.reject(error);
                }
                nbLogger("BaseBucket.loadBucket(), new Bucket, name=" + resName);
                var bucket = void 0;
                if (type === "file") {
                    bucket = new service.FileBucket(resName);
                }
                else {
                    bucket = new service.ObjectBucket(resName, mode);
                }
                var resAcl = resObj.ACL;
                if (resAcl != null) {
                    nbLogger("BaseBucket.loadBucket(), acl=" + resAcl);
                    var acl = new Acl();
                    acl._set(resAcl);
                    bucket.setAcl(acl);
                }
                var resContentAcl = resObj.contentACL;
                if (resContentAcl != null) {
                    nbLogger("BaseBucket.loadBucket(), contentAcl=" + resContentAcl);
                    var contentAcl = new Acl();
                    contentAcl._set(resContentAcl);
                    bucket.setContentAcl(contentAcl);
                }
                var resDescription = resObj.description;
                if (resDescription != null) {
                    nbLogger("BaseBucket.loadBucket(), description=" + resDescription);
                    bucket.setDescription(resDescription);
                }
                return bucket;
            }
            catch (e) {
                nbLogger("BaseBucket.loadBucket(), error : exception" + e);
                var error = _createError(0, e, e.toString(), name);
                return Promise.reject(error);
            }
        }, function (error) {
            nbLogger(("BaseBucket.loadBucket(), error: " + (_errorText(error))));
            error.data = name;
            return Promise.reject(error);
        });
        return _promisify(promise, callbacks);
    };
    BaseBucket._baseGetBucketList = function (type, service, local, callbacks) {
        nbLogger("BaseBucket.getBucketList(), type=" + type + ", callbacks=" + callbacks);
        var req;
        if (service.isOffline()) {
            var method = "getBucketList";
            if (local) {
                method = "getLocalBucketList";
            }
            req = new _SdeRequest(BaseBucket.getClassName(type), method);
        }
        else {
            var path = "/buckets/" + type;
            req = new HttpRequest(service, path);
            req.setMethod("GET");
            req.setContentType("application/json");
        }
        var promise = req.execute().then(function (response) {
            try {
                nbLogger("BaseBucket.getBucketList(), success : " + response);
                var resObj = JSON.parse(response);
                var buckets = resObj.results;
                if (buckets != null) {
                    nbLogger("BaseBucket.getBucketList(), buckets=" + buckets);
                    var bucketNames = [];
                    for (var _i = 0, buckets_1 = buckets; _i < buckets_1.length; _i++) {
                        var bucket = buckets_1[_i];
                        nbLogger("BaseBucket.getBucketList(), success : add bucketName = " + bucket.name);
                        if (bucket.name != null) {
                            bucketNames.push(bucket.name);
                        }
                        else {
                            nbLogger("BaseBucket.getBucketList(), [WARNING] No name in response");
                        }
                    }
                    return bucketNames;
                }
                else {
                    nbLogger("BaseBucket.getBucketList(), invalid response");
                    var error = _createError(0, "Invalid response", "", name);
                    return Promise.reject(error);
                }
            }
            catch (e) {
                nbLogger("BaseBucket.getBucketList(), success : exception" + e);
                var error = _createError(0, e, e);
                return Promise.reject(error);
            }
        }, function (error) {
            nbLogger(("BaseBucket.getBucketList(), error: " + (_errorText(error))));
            return Promise.reject(error);
        });
        return _promisify(promise, callbacks);
    };
    BaseBucket.prototype.saveBucket = function (callbacks) {
        var _this = this;
        nbLogger("BaseBucket.saveBucket(), callbacks=" + callbacks);
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(BaseBucket.getClassName(this._type), "saveBucket");
        }
        else {
            var path = this.getPath();
            req = new HttpRequest(this._service, path);
            req.setMethod("PUT");
            req.setContentType("application/json");
        }
        var body = {};
        if (this._acl != null) {
            body.ACL = this._acl._toJsonObject();
        }
        if (this._contentAcl != null) {
            body.contentACL = this._contentAcl._toJsonObject();
        }
        if (this._description != null) {
            body.description = this._description;
        }
        if (this._service.isOffline()) {
            body.bucketName = this.getBucketName();
            body.bucketMode = this.getBucketMode();
        }
        req.setData(body);
        nbLogger("BaseBucket.saveBucket(), body=" + JSON.stringify(body));
        var promise = req.execute().then(function (response) {
            nbLogger("success : " + response);
            nbLogger("bucketName : " + _this.getBucketName());
            try {
                nbLogger("success : " + response);
                var resObj = JSON.parse(response);
                if (resObj.ACL != null) {
                    if (!_this._acl) {
                        _this._acl = new Acl();
                    }
                    _this._acl._set(resObj.ACL);
                }
                if (resObj.contentACL != null) {
                    if (!_this._contentAcl) {
                        _this._contentAcl = new Acl();
                    }
                    _this._contentAcl._set(resObj.contentACL);
                }
                return _this;
            }
            catch (e) {
                nbLogger("success : " + e);
                return Promise.reject(e);
            }
        }, function (err) {
            nbLogger(("error: " + (_errorText(err))));
            err.data = _this;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    BaseBucket.prototype.deleteBucket = function (callbacks) {
        var _this = this;
        nbLogger("BaseBucket.deleteBucket(), callbacks=" + callbacks);
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(BaseBucket.getClassName(this._type), "deleteBucket");
            var body = {
                bucketName: this.getBucketName(),
                bucketMode: this.getBucketMode()
            };
            req.setData(body);
        }
        else {
            var path = this.getPath();
            req = new HttpRequest(this._service, path);
            req.setMethod("DELETE");
            req.setContentType("application/json");
        }
        var promise = req.execute().then(function () {
            nbLogger("BaseBucket.deleteBucket(), success");
            return _this;
        }, function (err) {
            nbLogger(("BaseBucket.deleteBucket(), error: " + (_errorText(err))));
            err.data = _this;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    BaseBucket.prototype.setAcl = function (acl) {
        if (acl != null && !(acl instanceof Acl)) {
            throw new Error("setAcl: not Acl instance!");
        }
        this._acl = acl;
    };
    BaseBucket.prototype.getAcl = function () {
        return this._acl;
    };
    BaseBucket.prototype.setContentAcl = function (acl) {
        if (acl != null && !(acl instanceof Acl)) {
            throw new Error("setContentAcl: not Acl instance!");
        }
        this._contentAcl = acl;
    };
    BaseBucket.prototype.getContentAcl = function () {
        return this._contentAcl;
    };
    BaseBucket.prototype.setDescription = function (description) {
        this._description = description;
    };
    BaseBucket.prototype.getDescription = function () {
        return this._description;
    };
    BaseBucket.prototype.getBucketName = function () {
        return this._name;
    };
    BaseBucket.prototype.setBucketName = function (name) {
        this._name = name;
    };
    BaseBucket.prototype.getBucketMode = function () {
        return this._mode;
    };
    BaseBucket.prototype.getPath = function (option) {
        var path = "/buckets" + "/" + this._type + "/" + encodeURIComponent(this._name);
        if (option != null) {
            path = path + option;
        }
        return path;
    };
    BaseBucket.prototype.getDataPath = function (option) {
        var dataType = "objects";
        if (this._type === "file") {
            dataType = "files";
        }
        var path = "/" + dataType + "/" + encodeURIComponent(this._name);
        if (option != null) {
            path = path + option;
        }
        return path;
    };
    BaseBucket.getClassName = function (type) {
        var className = "NebulaObjectBucket";
        if (type === "file") {
            className = "NebulaFileBucket";
        }
        return className;
    };
    BaseBucket.prototype.getClassName = function () {
        return BaseBucket.getClassName(this._type);
    };
    return BaseBucket;
}());
var ObjectBucketBase = (function (_super) {
    __extends(ObjectBucketBase, _super);
    function ObjectBucketBase(service, name, mode) {
        if (mode === void 0) { mode = Nebula.BUCKET_MODE_ONLINE; }
        var _this = _super.call(this, service, name, "object", mode) || this;
        _this._resolveId = null;
        return _this;
    }
    ObjectBucketBase._loadBucket = function (service, name, callbacks, mode) {
        nbLogger("ObjectBucket.loadBucket(), name=" + name + ", callbacks=" + callbacks);
        return BaseBucket._baseLoadBucket("object", service, name, mode, callbacks);
    };
    ObjectBucketBase._getBucketList = function (service, callbacks) {
        nbLogger("ObjectBucket.getBucketList(), callbacks=" + callbacks);
        return BaseBucket._baseGetBucketList("object", service, false, callbacks);
    };
    ObjectBucketBase._getLocalBucketList = function (service, callbacks) {
        nbLogger("ObjectBucket.getLocalBucketList(), callbacks=" + callbacks);
        return BaseBucket._baseGetBucketList("object", service, true, callbacks);
    };
    ObjectBucketBase.prototype.load = function (objectId, callbacks) {
        nbLogger("ObjectBucket.load()");
        if (objectId == null) {
            nbError("ObjectBucket.load(), Parameter is invalid");
            throw new Error("No objectId");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "load");
            var body = {
                bucketName: this.getBucketName(),
                bucketMode: this.getBucketMode(),
                objectId: objectId
            };
            req.setData(body);
        }
        else {
            var path = this.getDataPath("/" + objectId);
            req = new HttpRequest(this._service, path);
            req.setMethod("GET");
            req.setContentType("application/json");
        }
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                nbLogger("ObjectBucket.load(), success : response=" + response);
                return resObj;
            }
            catch (e) {
                nbLogger("ObjectBucket.load(), success : response=" + response);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = objectId;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("ObjectBucket.load(), error: " + (_errorText(err))));
            err.data = objectId;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.remove = function (objectId, callbacks, etag) {
        nbLogger("ObjectBucket.delete)");
        if (objectId == null) {
            nbError("ObjectBucket.remove(), Parameter is invalid");
            throw new Error("No objectId");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "delete");
            var body = {
                bucketName: this.getBucketName(),
                bucketMode: this.getBucketMode(),
                objectId: objectId
            };
            if (etag) {
                body.etag = etag;
            }
            req.setData(body);
        }
        else {
            var path = this.getDataPath("/" + objectId);
            req = new HttpRequest(this._service, path);
            req.setMethod("DELETE");
            req.setContentType("application/json");
            if (etag) {
                req.setQueryParam("etag", etag);
            }
        }
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.delete(), success");
            return objectId;
        }, function (err) {
            nbLogger(("ObjectBucket.delete(), error: " + (_errorText(err))));
            err.objectId = objectId;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.save = function (object, callbacks) {
        nbLogger("ObjectBucket.save()");
        if (!object) {
            nbError("ObjectBucket.save(), Parameter is invalid");
            throw new Error("No object");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "save");
            var body = {
                object: object,
                bucketName: this.getBucketName(),
                bucketMode: this.getBucketMode()
            };
            req.setData(body);
        }
        else {
            var queryParams = {};
            var path = void 0, method = void 0;
            if (object._id != null) {
                path = this.getDataPath("/" + object._id);
                method = "PUT";
                if (object.etag != null) {
                    queryParams.etag = object.etag;
                }
            }
            else {
                path = this.getDataPath();
                method = "POST";
            }
            nbLogger("ObjectBucket.save(), path=" + path);
            req = new HttpRequest(this._service, path);
            req.setContentType("application/json");
            req.setMethod(method);
            req.setQueryParams(queryParams);
            req.setData(object);
        }
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                nbLogger("ObjectBucket.save(), success");
                return resObj;
            }
            catch (e) {
                nbLogger("ObjectBucket.save(), success : exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = object;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("ObjectBucket.save(), error: " + (_errorText(err))));
            err.data = object;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.query = function (aQuery, callbacks) {
        return this._query(aQuery, {
            longQuery: this._service.ObjectBucket.useLongQuery
        }, callbacks);
    };
    ObjectBucketBase.prototype.longQuery = function (aQuery, callbacks) {
        return this._query(aQuery, {
            longQuery: true
        }, callbacks);
    };
    ObjectBucketBase.prototype.queryWithCount = function (aQuery, callbacks) {
        return this._query(aQuery, {
            countQuery: true,
            longQuery: this._service.ObjectBucket.useLongQuery
        }, callbacks);
    };
    ObjectBucketBase.prototype.longQueryWithCount = function (aQuery, callbacks) {
        return this._query(aQuery, {
            countQuery: true,
            longQuery: true
        }, callbacks);
    };
    ObjectBucketBase.prototype._query = function (aQuery, option, callbacks) {
        nbLogger("ObjectBucket.query()");
        if (option.countQuery) {
            if (aQuery == null) {
                aQuery = new ObjectQuery();
            }
            aQuery._setCountQuery(option.countQuery);
        }
        var req;
        var path;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "query");
            var body = {};
            if (aQuery != null) {
                if (aQuery.getClause() != null && aQuery.getClause().json() != null) {
                    body.clause = aQuery.getClause().json();
                }
                body.limit = aQuery.getLimit();
                body.skip = aQuery.getSkipCount();
                body.sort = aQuery.getSort();
                body.deleteMark = aQuery._getDeleteMark();
                body.countQuery = aQuery._isCountQuery();
            }
            body.bucketName = this.getBucketName();
            body.bucketMode = this.getBucketMode();
            req.setData(body);
        }
        else if (!option.longQuery) {
            path = this.getDataPath();
            req = new HttpRequest(this._service, path);
            req.setMethod("GET");
            if (aQuery != null) {
                req.setQueryParams(aQuery._toParam());
            }
        }
        else {
            path = this.getDataPath("/_query");
            req = new HttpRequest(this._service, path);
            req.setMethod("POST");
            req.setContentType("application/json");
            req.setData((aQuery != null) ? aQuery._toParamJson() : {});
        }
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                var objects = resObj.results;
                nbLogger("ObjectBucket.query(), success : size=" + objects.length);
                if (aQuery != null && aQuery._isCountQuery() === true) {
                    var count = -1;
                    if (resObj.count != null) {
                        count = resObj.count;
                    }
                    return {
                        objects: objects,
                        count: count
                    };
                }
                else {
                    return objects;
                }
            }
            catch (e) {
                nbLogger("ObjectBucket.query(), success : exception=" + e);
                var errorResult = _createError(0, e.toString(), e);
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("ObjectBucket.query(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype._checkOfflineService = function () {
        if (this._service !== Nebula) {
            nbError("ObjectBucket.setSyncScope(): Can't use for multitenant instance");
            throw new Error("No multitenant support");
        }
        if (!this._service.isOffline()) {
            nbError("ObjectBucket.setSyncScope(), supported offline mode only");
            throw new Error("No offline mode enabled");
        }
    };
    ObjectBucketBase.prototype.setSyncScope = function (scope, callbacks) {
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "setSyncScope");
        var body = {};
        var query = {};
        if (scope != null) {
            if (scope.getClause() != null && scope.getClause().json() != null) {
                query.clause = scope.getClause().json();
            }
            body.scope = query;
        }
        body.bucketName = this.getBucketName();
        body.bucketMode = this.getBucketMode();
        nbLogger("ObjectBucket.setSyncScope(), body=" + JSON.stringify(body));
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.setSyncScope(), success : response=" + response);
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.setSyncScope(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.getSyncScope = function (callbacks) {
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "getSyncScope");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.getSyncScope(), success : response=" + response);
            try {
                var resObj = JSON.parse(response);
                if (resObj.scope != null) {
                    var query = null;
                    if (!_compareObject(resObj.scope, {})) {
                        query = ObjectQuery._toObjectQuery(resObj.scope);
                    }
                    nbLogger("ObjectBucket.getSyncScope(), success : callback_data=" + resObj.scope);
                    return query;
                }
                else {
                    nbLogger("ObjectBucket.getSyncScope(), success : no scope property");
                    return Promise.reject(_createError(0, "Invalid response - no scope property", ""));
                }
            }
            catch (e) {
                nbLogger("ObjectBucket.getSyncScope(), success : exception=" + e);
                return Promise.reject(_createError(0, e.toString(), e));
            }
        }, function (err) {
            nbLogger(("ObjectBucket.getSyncScope(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.getResolveConflictPolicy = function (callbacks) {
        nbLogger("ObjectBucket.getResolveConflictPolicy()");
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "getResolveConflictPolicy");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.getResolveConflictPolicy(), success : response=" + response);
            try {
                var resObj = JSON.parse(response);
                if (resObj.results != null) {
                    return resObj.results;
                }
                else {
                    nbLogger("ObjectBucket.getResolveConflictPolicy(), success : no results");
                    return Promise.reject(_createError(0, "No results", ""));
                }
            }
            catch (e) {
                nbLogger("ObjectBucket.getResolveConflictPolicy(), success : exception=" + e);
                return Promise.reject(_createError(0, e.toString(), e));
            }
        }, function (err) {
            nbLogger(("ObjectBucket.getResolveConflictPolicy(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.setResolveConflictPolicy = function (policy, callbacks) {
        nbLogger("ObjectBucket.setResolveConflictPolicy()");
        this._checkOfflineService();
        if (policy == null) {
            nbError("ObjectBucket.setResolveConflictPolicy(), invalid parameter: no policy");
            throw new Error("No policy");
        }
        var req = new _SdeRequest(BaseBucket.getClassName(), "setResolveConflictPolicy");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode(),
            policy: policy
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.setResolveConflictPolicy(), success : response=" + response);
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.setResolveConflictPolicy(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.removeCacheBucket = function (callbacks) {
        nbLogger("ObjectBucket.removeCacheBucket()");
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "removeCacheBucket");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.removeCacheBucket(), success : response=" + response);
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.removeCacheBucket(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.setSyncEventListener = function (listener) {
        this._checkOfflineService();
        return _SdeSyncEventListener.setListener(this, listener);
    };
    ObjectBucketBase._sync = function (service, callbacks) {
        nbLogger("ObjectBucket.sync()");
        if (service !== Nebula) {
            nbError("ObjectBucket.setSyncScope(): Can't use for multitenant instance");
            throw new Error("No multitenant support");
        }
        if (!service.isOffline()) {
            nbError("ObjectBucket.sync(), supported offline mode only");
            throw new Error("No offline mode enabled");
        }
        var req = new _SdeRequest(BaseBucket.getClassName(), "sync");
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.sync(), success : response=" + response);
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.sync(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.syncBucket = function (callbacks) {
        nbLogger("ObjectBucket.syncBucket()");
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "syncBucket");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.syncBucket(), success : response=" + response);
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.syncBucket(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.resolveConflict = function (objectId, resolve) {
        nbLogger("ObjectBucket.resolveConflict()");
        this._checkOfflineService();
        if (objectId == null || resolve == null || this._resolveId == null) {
            nbError("ObjectBucket.syncObject(), invalid parameter, objectId=" + objectId + ", resolve=" + resolve + ", resolveId=" + this._resolveId);
            throw new Error("No objectId/resolve/resolveId");
        }
        var data = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode(),
            objectId: objectId,
            resolveId: this._getResolveId(),
            resolve: resolve
        };
        return _SdeSyncEventListener.resolveConflict(data);
    };
    ObjectBucketBase.prototype.setIndexToLocal = function (index, callbacks) {
        nbLogger("ObjectBucket.setIndexLocal()");
        this._checkOfflineService();
        if (!index) {
            nbError("ObjectBucket.setIndexLocal(), parameter is invalid");
            throw new Error("No index");
        }
        if (!index.index) {
            nbError("ObjectBucket.setIndexLocal(), index is invalid");
            throw new Error("No index property");
        }
        var req = new _SdeRequest(this.getClassName(), "setIndexToLocal");
        index.bucketName = this.getBucketName();
        index.bucketMode = this.getBucketMode();
        req.setData(index);
        var promise = req.execute().then(function () {
            nbLogger("ObjectBucket.setIndexLocal(), success");
            return;
        }, function (err) {
            nbLogger(("ObjectBucket.setIndexLocal(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.getIndexFromLocal = function (callbacks) {
        nbLogger("ObjectBucket.getIndexLocal()");
        this._checkOfflineService();
        var req = new _SdeRequest(this.getClassName(), "getIndexFromLocal");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.getIndexLocal(), success");
            try {
                var resObj = JSON.parse(response);
                var index = resObj.results;
                return index;
            }
            catch (e) {
                nbLogger("ObjectBucket.getIndexLocal(), success : exception=" + e);
                var errorResult = _createError(0, e.toString(), e);
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("ObjectBucket.getIndexLocal(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype.getLastSyncTime = function (callbacks) {
        nbLogger("ObjectBucket.getLastSyncTime()");
        this._checkOfflineService();
        var req = new _SdeRequest(BaseBucket.getClassName(), "getLastSyncTime");
        var body = {
            bucketName: this.getBucketName(),
            bucketMode: this.getBucketMode()
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("ObjectBucket.getLastSyncTime(), success : response=" + response);
            try {
                var resObj = JSON.parse(response);
                if (resObj.results != null) {
                    return resObj.results;
                }
                else {
                    nbLogger("ObjectBucket.getLastSyncTime(), success : no results");
                    return null;
                }
            }
            catch (e) {
                nbLogger("ObjectBucket.getLastSyncTime(), success : exception=" + e);
                return Promise.reject(_createError(0, e.toString(), e));
            }
        }, function (err) {
            nbLogger(("ObjectBucket.getLastSyncTime(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    ObjectBucketBase.prototype._getResolveId = function () {
        nbLogger("ObjectBucket._getResolveId(), resolveId=" + this._resolveId);
        return this._resolveId;
    };
    ObjectBucketBase.prototype._setResolveId = function (resolveId) {
        nbLogger("ObjectBucket._setResolveId(), cur=" + this._resolveId + ", new=" + resolveId);
        return this._resolveId = resolveId;
    };
    ObjectBucketBase.prototype.batch = function (request, callbacks) {
        var path = this.getDataPath("/_batch");
        var req = new HttpRequest(this._service, path);
        req.setMethod("POST");
        req.setContentType("application/json");
        req.setData(request.json);
        var promise = req.execute().then(function (response) {
            var json = JSON.parse(response);
            var failedCount = 0;
            for (var _i = 0, _a = json.results; _i < _a.length; _i++) {
                var result = _a[_i];
                if (result.result !== "ok") {
                    failedCount++;
                }
            }
            json.failedCount = failedCount;
            return json;
        }, function (err) {
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    return ObjectBucketBase;
}(BaseBucket));
var declareObjectBucket = function (_service) {
    _service.ObjectBucket = (_a = (function (_super) {
            __extends(ObjectBucket, _super);
            function ObjectBucket(name, mode) {
                if (mode === void 0) { mode = Nebula.BUCKET_MODE_ONLINE; }
                return _super.call(this, _service, name, mode) || this;
            }
            ObjectBucket.loadBucket = function (name, callbacks, mode) {
                return _super._loadBucket.call(this, _service, name, callbacks, mode);
            };
            ObjectBucket.getBucketList = function (callbacks) {
                return _super._getBucketList.call(this, _service, callbacks);
            };
            ObjectBucket.getLocalBucketList = function (callbacks) {
                return _super._getLocalBucketList.call(this, _service, callbacks);
            };
            ObjectBucket.prototype.saveBucket = function (callbacks) {
                return _super.prototype.saveBucket.call(this, callbacks);
            };
            ObjectBucket.prototype.deleteBucket = function (callbacks) {
                return _super.prototype.deleteBucket.call(this, callbacks);
            };
            ObjectBucket.prototype.setAcl = function (acl) {
                _super.prototype.setAcl.call(this, acl);
                return this;
            };
            ObjectBucket.prototype.getAcl = function () {
                return _super.prototype.getAcl.call(this);
            };
            ObjectBucket.prototype.setContentAcl = function (acl) {
                _super.prototype.setContentAcl.call(this, acl);
                return this;
            };
            ObjectBucket.prototype.getContentAcl = function () {
                return _super.prototype.getContentAcl.call(this);
            };
            ObjectBucket.prototype.setDescription = function (description) {
                return _super.prototype.setDescription.call(this, description);
            };
            ObjectBucket.prototype.getDescription = function () {
                return _super.prototype.getDescription.call(this);
            };
            ObjectBucket.prototype.getBucketName = function () {
                return _super.prototype.getBucketName.call(this);
            };
            ObjectBucket.prototype._setBucketName = function (name) {
                return _super.prototype.setBucketName.call(this, name);
            };
            ObjectBucket.prototype.getBucketMode = function () {
                return _super.prototype.getBucketMode.call(this);
            };
            ObjectBucket.prototype.load = function (objectId, callbacks) {
                return _super.prototype.load.call(this, objectId, callbacks);
            };
            ObjectBucket.prototype.remove = function (objectId, callbacks, etag) {
                return _super.prototype.remove.call(this, objectId, callbacks, etag);
            };
            ObjectBucket.prototype.delete = function (objectId, callbacks, etag) {
                return _super.prototype.remove.call(this, objectId, callbacks, etag);
            };
            ObjectBucket.prototype.save = function (object, callbacks) {
                return _super.prototype.save.call(this, object, callbacks);
            };
            ObjectBucket.prototype.query = function (aQuery, callbacks) {
                return _super.prototype.query.call(this, aQuery, callbacks);
            };
            ObjectBucket.prototype.longQuery = function (aQuery, callbacks) {
                return _super.prototype.longQuery.call(this, aQuery, callbacks);
            };
            ObjectBucket.prototype.queryWithCount = function (aQuery, callbacks) {
                return _super.prototype.queryWithCount.call(this, aQuery, callbacks);
            };
            ObjectBucket.prototype.longQueryWithCount = function (aQuery, callbacks) {
                return _super.prototype.longQueryWithCount.call(this, aQuery, callbacks);
            };
            ObjectBucket.prototype.setSyncScope = function (scope, callbacks) {
                return _super.prototype.setSyncScope.call(this, scope, callbacks);
            };
            ObjectBucket.prototype.getSyncScope = function (callbacks) {
                return _super.prototype.getSyncScope.call(this, callbacks);
            };
            ObjectBucket.prototype.getResolveConflictPolicy = function (callbacks) {
                return _super.prototype.getResolveConflictPolicy.call(this, callbacks);
            };
            ObjectBucket.prototype.setResolveConflictPolicy = function (policy, callbacks) {
                return _super.prototype.setResolveConflictPolicy.call(this, policy, callbacks);
            };
            ObjectBucket.prototype.removeCacheBucket = function (callbacks) {
                return _super.prototype.removeCacheBucket.call(this, callbacks);
            };
            ObjectBucket.prototype.setSyncEventListener = function (listener) {
                _super.prototype.setSyncEventListener.call(this, listener);
            };
            ObjectBucket.sync = function (callbacks) {
                return _super._sync.call(this, _service, callbacks);
            };
            ObjectBucket.prototype.syncBucket = function (callbacks) {
                return _super.prototype.syncBucket.call(this, callbacks);
            };
            ObjectBucket.prototype.resolveConflict = function (objectId, resolve) {
                return _super.prototype.resolveConflict.call(this, objectId, resolve);
            };
            ObjectBucket.prototype.setIndexToLocal = function (index, callbacks) {
                return _super.prototype.setIndexToLocal.call(this, index, callbacks);
            };
            ObjectBucket.prototype.getIndexFromLocal = function (callbacks) {
                return _super.prototype.getIndexFromLocal.call(this, callbacks);
            };
            ObjectBucket.prototype.getLastSyncTime = function (callbacks) {
                return _super.prototype.getLastSyncTime.call(this, callbacks);
            };
            ObjectBucket.prototype._getResolveId = function () {
                return _super.prototype._getResolveId.call(this);
            };
            ObjectBucket.prototype._setResolveId = function (resolveId) {
                return _super.prototype._setResolveId.call(this, resolveId);
            };
            ObjectBucket.prototype.batch = function (request, callbacks) {
                return _super.prototype.batch.call(this, request, callbacks);
            };
            return ObjectBucket;
        }(ObjectBucketBase)),
        _a.CONFLICT_POLICY_MANUAL = 0,
        _a.CONFLICT_POLICY_CLIENT = 1,
        _a.CONFLICT_POLICY_SERVER = 2,
        _a.RESOLVE_CONFLICT_UNDEFINED = -1,
        _a.RESOLVE_CONFLICT_CLIENT = 1,
        _a.RESOLVE_CONFLICT_SERVER = 2,
        _a.SYNC_ERROR_UNDEFINED = -1,
        _a.SYNC_ERROR_PUSH = 0,
        _a.SYNC_ERROR_PULL = 1,
        _a.SYNC_ERROR_OVERLAP_ID = 2,
        _a.SYNC_ERROR_PUSH_RESYNCING = 3,
        _a.useLongQuery = false,
        _a);
    var _a;
};
var FileBucketBase = (function (_super) {
    __extends(FileBucketBase, _super);
    function FileBucketBase(service, name) {
        var _this = _super.call(this, service, name, "file") || this;
        _this._resolveId = null;
        return _this;
    }
    FileBucketBase._loadBucket = function (service, name, callbacks) {
        nbLogger("FileBucket.loadBucket(), name=" + name + ", callbacks=" + callbacks);
        return BaseBucket._baseLoadBucket("file", service, name, Nebula.BUCKET_MODE_ONLINE, callbacks);
    };
    FileBucketBase._getBucketList = function (service, callbacks) {
        return BaseBucket._baseGetBucketList("file", service, false, callbacks);
    };
    FileBucketBase.prototype._save = function (fileName, data, metadata, update, callbacks) {
        nbLogger("FileBucket._save()");
        if (!fileName) {
            nbLogger("FileBucket._save(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        if (!data) {
            nbLogger("FileBucket._save(), Parameter is invalid : data");
            throw new Error("No data");
        }
        if (!(typeof Blob !== "undefined" && Blob !== null) && !(typeof Buffer !== "undefined" && Buffer !== null)) {
            nbLogger("FileBucket._save(), Not supported Blob nor Buffer");
            throw new Error("No Blob/Buffer support");
        }
        if ((typeof data !== "string")
            && (typeof Blob !== "undefined" && Blob !== null && !(data instanceof Blob))
            && (typeof Buffer !== "undefined" && Buffer !== null && !(Buffer.isBuffer(data)))) {
            nbLogger("FileBucket._save(), Data is not String, Blob nor Buffer");
            throw new Error("data is not String, Blob nor Buffer");
        }
        if (!update) {
            if (!metadata || !metadata.getContentType()) {
                nbLogger("FileBucket._save(), Parameter is invalid : metadata.contentType");
                throw new Error("No contentType in metadata");
            }
        }
        var path = this.getDataPath("/" + encodeURIComponent(fileName));
        nbLogger("FileBucket._save(), path=" + path);
        var req = new HttpRequest(this._service, path);
        if (update) {
            req.setMethod("PUT");
        }
        else {
            req.setMethod("POST");
            req.setContentType(metadata.getContentType());
            if (metadata.getAcl() != null) {
                req.addRequestHeader("X-ACL", metadata.getAcl()._toString());
            }
            if (metadata.getOptions() != null) {
                req.addRequestHeader("X-Meta-Options", JSON.stringify(metadata.getOptions()));
            }
        }
        req.setData(data);
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                if (metadata === null) {
                    metadata = new FileMetadata();
                }
                metadata._setMetadata(resObj);
                return metadata;
            }
            catch (e) {
                nbLogger("FileBucket._save(), success: exception=" + e);
                var error = _createError(0, "Invalid response from server", e, fileName);
                return Promise.reject(error);
            }
        }, function (error) {
            nbLogger(("FileBucket._save(), error: " + (_errorText(error))));
            error.data = fileName;
            return Promise.reject(error);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.saveAs = function (fileName, data, metadata, callbacks) {
        return this._save(fileName, data, metadata, false, callbacks);
    };
    FileBucketBase.prototype.save = function (fileName, data, callbacks) {
        return this._save(fileName, data, null, true, callbacks);
    };
    FileBucketBase.prototype.load = function (fileName, callbacks) {
        nbLogger("FileBucket.load()");
        if (!(typeof fileName !== "undefined" && fileName !== null)) {
            nbLogger("FileBucket.load(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        if (!(typeof Blob !== "undefined" && Blob !== null) && !(typeof Buffer !== "undefined" && Buffer !== null)) {
            nbLogger("FileBucket.load(), Not supported Blob nor Buffer");
            throw new Error("No Blob/Buffer support");
        }
        var path = this.getDataPath("/" + encodeURIComponent(fileName));
        nbLogger("FileBucket.load(), path=" + path);
        var req = new HttpRequest(this._service, path);
        req.setMethod("GET");
        if (typeof Blob !== "undefined" && Blob !== null) {
            req.setResponseType("blob");
        }
        else if (typeof Buffer !== "undefined" && Buffer !== null) {
            req.setResponseType("buffer");
        }
        var promise = req.execute().then(function (response) {
            return response;
        }, function (err) {
            nbLogger(("FileBucket.load(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.remove = function (fileName, callbacks) {
        nbLogger("FileBucket.delete()");
        if (!(typeof fileName !== "undefined" && fileName !== null)) {
            nbLogger("FileBucket.delete(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "delete");
            var body = {
                bucketName: this.getBucketName(),
                fileName: fileName
            };
            req.setData(body);
        }
        else {
            var path = this.getDataPath("/" + encodeURIComponent(fileName));
            nbLogger("FileBucket.delete(), path=" + path);
            req = new HttpRequest(this._service, path);
            req.setMethod("DELETE");
        }
        var promise = req.execute().then(function (response) {
            nbLogger("FileBucket.delete(), success: " + fileName);
            return fileName;
        }, function (err) {
            nbLogger(("FileBucket.delete(), error: " + (_errorText(err)) + " : " + (fileName)));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype._createMetadata = function (obj) {
        var metadata = new FileMetadata();
        metadata._setMetadata(obj);
        return metadata;
    };
    FileBucketBase.prototype._publish = function (fileName, published, callbacks) {
        var _this = this;
        nbLogger("FileBucket._publish(), fileName=" + fileName + ", setFlg=" + published);
        if (!(typeof fileName !== "undefined" && fileName !== null)) {
            nbLogger("FileBucket._publish(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "publish");
            var body = {
                bucketName: this.getBucketName(),
                fileName: fileName,
                published: published
            };
            req.setData(body);
        }
        else {
            var path = this.getDataPath("/" + encodeURIComponent(fileName) + "/publish");
            nbLogger("FileBucket._publish(), path=" + path);
            req = new HttpRequest(this._service, path);
            if (published) {
                req.setMethod("PUT");
            }
            else {
                req.setMethod("DELETE");
            }
        }
        var promise = req.execute().then(function (response) {
            nbLogger("FileBucket._publish(), success: " + fileName);
            try {
                var resObj = JSON.parse(response);
                var metadata = _this._createMetadata(resObj);
                return metadata;
            }
            catch (e) {
                nbLogger("FileBucket._publish(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket._publish(), error: " + (_errorText) + " : " + (fileName)));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.publish = function (fileName, callbacks) {
        nbLogger("FileBucket.publish()");
        return this._publish(fileName, true, callbacks);
    };
    FileBucketBase.prototype.unpublish = function (fileName, callbacks) {
        nbLogger("FileBucket.unpublish()");
        return this._publish(fileName, false, callbacks);
    };
    FileBucketBase.prototype._getList = function (published, deleteMark, callbacks) {
        var _this = this;
        nbLogger("FileBucket._getList(), published=" + published);
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "getList");
            var body = {
                bucketName: this.getBucketName(),
                published: published,
                deleteMark: deleteMark
            };
            req.setData(body);
        }
        else {
            var path = this.getDataPath();
            nbLogger("FileBucket._getList(), path=" + path);
            req = new HttpRequest(this._service, path);
            req.setMethod("GET");
            if (published) {
                req.setQueryParam("published", "1");
            }
            if (deleteMark) {
                req.setQueryParam("deleteMark", "1");
            }
        }
        var promise = req.execute().then(function (response) {
            nbLogger("FileBucket._getList(), success");
            try {
                var resObj = JSON.parse(response);
                var resArray = resObj.results;
                var metaList = [];
                if (resArray != null) {
                    for (var _i = 0, resArray_2 = resArray; _i < resArray_2.length; _i++) {
                        var obj = resArray_2[_i];
                        var metadata = _this._createMetadata(obj);
                        metaList.push(metadata);
                    }
                }
                return metaList;
            }
            catch (e) {
                nbLogger("FileBucket._getList(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket._getList(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.getList = function (callbacks) {
        nbLogger("FileBucket.getList()");
        return this._getList(false, false, callbacks);
    };
    FileBucketBase.prototype.getPublishedList = function (callbacks) {
        nbLogger("FileBucket.getPublishedList()");
        return this._getList(true, false, callbacks);
    };
    FileBucketBase.prototype.getMetadata = function (fileName, callbacks) {
        var _this = this;
        nbLogger("FileBucket.getMetadata(), fileName=" + fileName);
        if (!(typeof fileName !== "undefined" && fileName !== null)) {
            nbLogger("FileBucket.getMetadata(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "getMetadata");
            var body = {
                bucketName: this.getBucketName(),
                fileName: fileName
            };
            req.setData(body);
        }
        else {
            var path = this.getDataPath("/" + encodeURIComponent(fileName) + "/meta");
            nbLogger("FileBucket.getMetadata(), path=" + path);
            req = new HttpRequest(this._service, path);
            req.setMethod("GET");
        }
        var promise = req.execute().then(function (response) {
            nbLogger("FileBucket.getMetadata(), success");
            try {
                var resObj = JSON.parse(response);
                var metadata = _this._createMetadata(resObj);
                return metadata;
            }
            catch (e) {
                nbLogger("FileBucket.getMetadata(), Invalid response : " + response);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.getMetadata(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.updateMetadata = function (fileName, metadata, callbacks) {
        nbLogger("FileBucket.updateMetadata(), fileName=" + fileName);
        if (fileName == null || fileName === "") {
            nbLogger("FileBucket.updateMetadata(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        if (!(metadata instanceof FileMetadata)) {
            nbLogger("FileBucket.updateMetadata(), Parameter is invalid : metadata");
            throw new Error("metadata is not instance of FileMetadata");
        }
        var body = {};
        var req;
        if (this._service.isOffline()) {
            req = new _SdeRequest(this.getClassName(), "updateMetadata");
            body.bucketName = this.getBucketName();
            body.targetFileName = fileName;
            body.cacheDisabled = metadata.isCacheDisabled();
        }
        else {
            var path = this.getDataPath("/" + encodeURIComponent(fileName) + "/meta");
            nbLogger("FileBucket.updateMetadata(), path=" + path);
            req = new HttpRequest(this._service, path);
            req.setMethod("PUT");
        }
        if (metadata.getFileName() != null) {
            body.filename = metadata.getFileName();
        }
        if (metadata.getContentType() != null) {
            body.contentType = metadata.getContentType();
        }
        if (metadata.getAcl() != null) {
            body.ACL = metadata.getAcl()._toJsonObject();
        }
        if (metadata.getOptions() != null) {
            body.options = JSON.stringify(metadata.getOptions());
        }
        req.setData(body);
        var promise = req.execute().then(function (response) {
            nbLogger("FileBucket.updateMetadata(), success");
            try {
                var resObj = JSON.parse(response);
                metadata._setMetadata(resObj);
                return metadata;
            }
            catch (e) {
                nbLogger("FileBucket.updateMetadata(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.updateMetadata(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase._checkOfflineService = function (service) {
        if (service !== Nebula) {
            nbLogger("ObjectBucket.setSyncScope(): Can't use for multitenant instance");
            throw new Error("No multitenant support");
        }
        if (!service.isOffline()) {
            nbLogger("ObjectBucket.setSyncScope(), supported offline mode only");
            throw new Error("No offline mode enabled");
        }
    };
    FileBucketBase._selectUploadFile = function (service, callbacks) {
        nbLogger("FileBucket.selectUploadFile()");
        this._checkOfflineService(service);
        var req = new _SdeRequest(BaseBucket.getClassName("file"), "selectUploadFile");
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                return resObj;
            }
            catch (e) {
                nbLogger("FileBucket.selectUploadFile(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.selectUploadFile(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase._selectDirectory = function (service, callbacks) {
        nbLogger("FileBucket.selectDirectory()");
        this._checkOfflineService(service);
        var req = new _SdeRequest(BaseBucket.getClassName("file"), "selectDirectory");
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                return resObj.path;
            }
            catch (e) {
                nbLogger("FileBucket.selectUploadFile(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.selectDirectory(), error: " + (_errorText(err))));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype._uploadFile = function (fileName, filePath, metadata, update, callbacks) {
        nbLogger("FileBucket._uploadFile()");
        if (!this._service.isOffline()) {
            nbLogger("FileBucket._uploadFile(), only offline mode");
            throw new Error("No offline mode enabled");
        }
        if (!fileName || fileName === "") {
            nbLogger("FileBucket._uploadFile(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        if (!filePath || filePath === "") {
            nbLogger("FileBucket._uploadFile(), Parameter is invalid : filePath");
            throw new Error("No filePath");
        }
        if (!metadata || !metadata.getContentType() || metadata.getContentType() === "") {
            nbLogger("FileBucket._uploadFile(), Parameter is invalid : metadata");
            throw new Error("No metadata.contentType");
        }
        var method = "uploadNewFile";
        if (update) {
            method = "uploadUpdateFile";
        }
        var req = new _SdeRequest(this.getClassName(), method);
        var body = {};
        body.bucketName = this.getBucketName();
        body.fileName = fileName;
        body.filePath = filePath;
        body.cacheDisabled = metadata.isCacheDisabled();
        body.contentType = metadata.getContentType();
        if (metadata.getAcl() != null) {
            body.ACL = metadata.getAcl()._toJsonObject();
        }
        if (metadata.getOptions() != null) {
            body.options = JSON.stringify(metadata.getOptions());
        }
        req.setData(body);
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                if (metadata === null) {
                    metadata = new FileMetadata();
                }
                metadata._setMetadata(resObj);
                return metadata;
            }
            catch (e) {
                nbLogger("FileBucket.uploadNewFile(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.uploadNewFile(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.uploadNewFile = function (fileName, filePath, metadata, callbacks) {
        nbLogger("FileBucket.uploadNewFile()");
        return this._uploadFile(fileName, filePath, metadata, false, callbacks);
    };
    FileBucketBase.prototype.uploadUpdateFile = function (fileName, filePath, metadata, callbacks) {
        nbLogger("FileBucket.uploadUpdateFile()");
        return this._uploadFile(fileName, filePath, metadata, true, callbacks);
    };
    FileBucketBase.prototype.downloadFile = function (fileName, filePath, callbacks) {
        nbLogger("FileBucket.downloadFile()");
        FileBucketBase._checkOfflineService(this._service);
        if (!fileName || fileName === "") {
            nbLogger("FileBucket.downloadFile(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        if (!filePath || filePath === "") {
            nbLogger("FileBucket.downloadFile(), Parameter is invalid : filePath");
            throw new Error("No filePath");
        }
        var req = new _SdeRequest(this.getClassName(), "downloadFile");
        var body = {
            bucketName: this.getBucketName(),
            fileName: fileName,
            filePath: filePath
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            try {
                var resObj = JSON.parse(response);
                nbLogger("FileBucket.downloadFile(), response=" + response);
                return fileName;
            }
            catch (e) {
                nbLogger("FileBucket.downloadFile(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.downloadFile(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    FileBucketBase.prototype.requestCancel = function (fileName, callbacks) {
        nbLogger("FileBucket.requestCancel()");
        FileBucketBase._checkOfflineService(this._service);
        if (!(typeof fileName !== "undefined" && fileName !== null) || fileName === "") {
            nbLogger("FileBucket.requestCancel(), Parameter is invalid : fileName");
            throw new Error("No fileName");
        }
        var req = new _SdeRequest(this.getClassName(), "requestCancel");
        var body = {
            bucketName: this.getBucketName(),
            fileName: fileName
        };
        req.setData(body);
        var promise = req.execute().then(function (response) {
            try {
                nbLogger("FileBucket.requestCancel(), response=" + response);
                return fileName;
            }
            catch (e) {
                nbLogger("FileBucket.requestCancel(), success: exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                errorResult.data = fileName;
                return Promise.reject(errorResult);
            }
        }, function (err) {
            nbLogger(("FileBucket.requestCancel(), error: " + (_errorText(err))));
            err.data = fileName;
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    return FileBucketBase;
}(BaseBucket));
var declareFileBucket = function (_service) {
    _service.FileBucket = (function (_super) {
        __extends(FileBucket, _super);
        function FileBucket(name) {
            return _super.call(this, _service, name) || this;
        }
        FileBucket.loadBucket = function (name, callbacks) {
            return _super._loadBucket.call(this, _service, name, callbacks);
        };
        FileBucket.getBucketList = function (callbacks) {
            return _super._getBucketList.call(this, _service, callbacks);
        };
        FileBucket.prototype.saveBucket = function (callbacks) {
            return _super.prototype.saveBucket.call(this, callbacks);
        };
        FileBucket.prototype.deleteBucket = function (callbacks) {
            return _super.prototype.deleteBucket.call(this, callbacks);
        };
        FileBucket.prototype.setAcl = function (acl) {
            _super.prototype.setAcl.call(this, acl);
            return this;
        };
        FileBucket.prototype.getAcl = function () {
            return _super.prototype.getAcl.call(this);
        };
        FileBucket.prototype.setContentAcl = function (acl) {
            _super.prototype.setContentAcl.call(this, acl);
            return this;
        };
        FileBucket.prototype.getContentAcl = function () {
            return _super.prototype.getContentAcl.call(this);
        };
        FileBucket.prototype.setDescription = function (description) {
            _super.prototype.setDescription.call(this, description);
            return this;
        };
        FileBucket.prototype.getDescription = function () {
            return _super.prototype.getDescription.call(this);
        };
        FileBucket.prototype.getBucketName = function () {
            return _super.prototype.getBucketName.call(this);
        };
        FileBucket.prototype._setBucketName = function (name) {
            _super.prototype.setBucketName.call(this, name);
            return this;
        };
        FileBucket.prototype.saveAs = function (fileName, data, metadata, callbacks) {
            return _super.prototype.saveAs.call(this, fileName, data, metadata, callbacks);
        };
        FileBucket.prototype.save = function (fileName, data, callbacks) {
            return _super.prototype.save.call(this, fileName, data, callbacks);
        };
        FileBucket.prototype.load = function (fileName, callbacks) {
            return _super.prototype.load.call(this, fileName, callbacks);
        };
        FileBucket.prototype.remove = function (fileName, callbacks) {
            return _super.prototype.remove.call(this, fileName, callbacks);
        };
        FileBucket.prototype.delete = function (fileName, callbacks) {
            return _super.prototype.remove.call(this, fileName, callbacks);
        };
        FileBucket.prototype._createMetadata = function (obj) {
            return _super.prototype._createMetadata.call(this, obj);
        };
        FileBucket.prototype.publish = function (fileName, callbacks) {
            return _super.prototype.publish.call(this, fileName, callbacks);
        };
        FileBucket.prototype.unpublish = function (fileName, callbacks) {
            return _super.prototype.unpublish.call(this, fileName, callbacks);
        };
        FileBucket.prototype.getList = function (callbacks) {
            return _super.prototype.getList.call(this, callbacks);
        };
        FileBucket.prototype.getPublishedList = function (callbacks) {
            return _super.prototype.getPublishedList.call(this, callbacks);
        };
        FileBucket.prototype.getMetadata = function (fileName, callbacks) {
            return _super.prototype.getMetadata.call(this, fileName, callbacks);
        };
        FileBucket.prototype.updateMetadata = function (fileName, metadata, callbacks) {
            return _super.prototype.updateMetadata.call(this, fileName, metadata, callbacks);
        };
        FileBucket.selectUploadFile = function (callbacks) {
            return _super._selectUploadFile.call(this, _service, callbacks);
        };
        FileBucket.selectDirectory = function (callbacks) {
            return _super._selectDirectory.call(this, _service, callbacks);
        };
        FileBucket.prototype.uploadNewFile = function (fileName, filePath, metadata, callbacks) {
            return _super.prototype.uploadNewFile.call(this, fileName, filePath, metadata, callbacks);
        };
        FileBucket.prototype.uploadUpdateFile = function (fileName, filePath, metadata, callbacks) {
            return _super.prototype.uploadUpdateFile.call(this, fileName, filePath, metadata, callbacks);
        };
        FileBucket.prototype.downloadFile = function (fileName, filePath, callbacks) {
            return _super.prototype.downloadFile.call(this, fileName, filePath, callbacks);
        };
        FileBucket.prototype.requestCancel = function (fileName, callbacks) {
            return _super.prototype.requestCancel.call(this, fileName, callbacks);
        };
        return FileBucket;
    }(FileBucketBase));
};
var CustomApiBase = (function () {
    function CustomApiBase(service, apiname, method, subpath) {
        this._service = service;
        this.apiname = apiname;
        this.method = method;
        this.subpath = subpath;
        this.headers = {};
        this.receiveResponseHeaders = false;
        this.path = "/api/" + apiname;
        if (subpath) {
            if (subpath.indexOf("/") !== 0) {
                this.path += "/";
            }
            this.path += subpath;
        }
    }
    CustomApiBase.prototype.setContentType = function (contentType) {
        this.contentType = contentType;
    };
    CustomApiBase.prototype.clearHeaders = function () {
        this.headers = {};
    };
    CustomApiBase.prototype.addHeader = function (name, value) {
        this.headers[name] = value;
    };
    CustomApiBase.prototype.setBinaryResponse = function () {
        if (typeof Blob !== "undefined" && Blob !== null) {
            this.responseType = "blob";
        }
        else if (typeof Buffer !== "undefined" && Buffer !== null) {
            this.responseType = "buffer";
        }
        else {
            throw new Error("No blob / buffer");
        }
    };
    CustomApiBase.prototype.setReceiveResponseHeaders = function (receive) {
        this.receiveResponseHeaders = receive;
    };
    CustomApiBase.prototype.execute = function (data, callbacks) {
        var request = new HttpRequest(this._service, this.path);
        request.setMethod(this.method);
        if (data) {
            if (this.method == "GET" || this.method == "DELETE") {
                request.setQueryParams(data);
            }
            else {
                request.setData(data);
            }
        }
        if (this.responseType != null) {
            request.setResponseType(this.responseType);
        }
        if (this.contentType != null) {
            request.setContentType(this.contentType);
        }
        for (var key in this.headers) {
            request.addRequestHeader(key, this.headers[key]);
        }
        request.setReceiveResponseHeaders(this.receiveResponseHeaders);
        var promise = request.execute()
            .then(function (response) {
            nbLogger("CustomApi#success");
            return response;
        })
            .catch(function (err) {
            nbLogger("CustomApi#error " + _errorText(err));
            return Promise.reject(err);
        });
        return _promisify(promise, callbacks);
    };
    return CustomApiBase;
}());
var declareCustomApi = function (_service) {
    _service.CustomApi = (function (_super) {
        __extends(CustomApi, _super);
        function CustomApi(apiname, method, subpath) {
            return _super.call(this, _service, apiname, method, subpath) || this;
        }
        CustomApi.prototype.setContentType = function (contentType) {
            _super.prototype.setContentType.call(this, contentType);
            return this;
        };
        CustomApi.prototype.addHeader = function (name, value) {
            _super.prototype.addHeader.call(this, name, value);
            return this;
        };
        CustomApi.prototype.clearHeaders = function () {
            _super.prototype.clearHeaders.call(this);
            return this;
        };
        CustomApi.prototype.setReceiveResponseHeaders = function (receive) {
            _super.prototype.setReceiveResponseHeaders.call(this, receive);
            return this;
        };
        CustomApi.prototype.execute = function (data, callbacks) {
            return _super.prototype.execute.call(this, data, callbacks);
        };
        CustomApi.prototype.setBinaryResponse = function () {
            _super.prototype.setBinaryResponse.call(this);
            return this;
        };
        return CustomApi;
    }(CustomApiBase));
};
var ApnsFields = (function () {
    function ApnsFields() {
        this._fields = {};
    }
    Object.defineProperty(ApnsFields.prototype, "badge", {
        get: function () {
            return this._fields.badge;
        },
        set: function (badge) {
            if (!this._isInteger(badge)) {
                throw new Error("ApnsFields.badge, Not integer: " + badge);
            }
            this._fields.badge = badge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApnsFields.prototype, "sound", {
        get: function () {
            return this._fields.sound;
        },
        set: function (sound) {
            if (typeof sound !== "string") {
                throw new Error("ApnsFields.sound, Not string: " + sound);
            }
            this._fields.sound = sound;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApnsFields.prototype, "contentAvailable", {
        get: function () {
            return this._fields["content-available"];
        },
        set: function (contentAvailable) {
            if (!this._isInteger(contentAvailable)) {
                throw new Error("ApnsFields.contentAvailable, Not integer: " + contentAvailable);
            }
            this._fields["content-available"] = contentAvailable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApnsFields.prototype, "category", {
        get: function () {
            return this._fields.category;
        },
        set: function (category) {
            if (typeof category !== "string") {
                throw new Error("ApnsFields.category, Not string: " + category);
            }
            this._fields.category = category;
        },
        enumerable: true,
        configurable: true
    });
    ApnsFields.prototype._isInteger = function (value) {
        if (typeof value !== "number")
            return false;
        return parseInt(value.toString(), 10) === value;
    };
    return ApnsFields;
}());
var GcmFields = (function () {
    function GcmFields() {
        this._fields = {};
    }
    Object.defineProperty(GcmFields.prototype, "title", {
        get: function () {
            return this._fields.title;
        },
        set: function (title) {
            if (typeof title === "string") {
                this._fields.title = title;
            }
            else {
                throw new Error("GcmFields.title, Invalid value: " + title);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GcmFields.prototype, "uri", {
        get: function () {
            return this._fields.uri;
        },
        set: function (uri) {
            if (typeof uri === "string") {
                this._fields.uri = uri;
            }
            else {
                throw new Error("GcmFields.uri, Invalid value: " + uri);
            }
        },
        enumerable: true,
        configurable: true
    });
    return GcmFields;
}());
var SseFields = (function () {
    function SseFields() {
        this._fields = {};
    }
    Object.defineProperty(SseFields.prototype, "eventId", {
        get: function () {
            return this._fields.sseEventId;
        },
        set: function (eventId) {
            if (typeof eventId !== "string") {
                throw new Error("SseFields.eventId, Not string: " + eventId);
            }
            this._fields.sseEventId = eventId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SseFields.prototype, "eventType", {
        get: function () {
            return this._fields.sseEventType;
        },
        set: function (eventType) {
            if (typeof eventType !== "string") {
                throw new Error("SseFields.eventType, Not string: " + eventType);
            }
            this._fields.sseEventType = eventType;
        },
        enumerable: true,
        configurable: true
    });
    return SseFields;
}());
var PushSenderBase = (function () {
    function PushSenderBase(service) {
        this._service = service;
    }
    PushSenderBase.prototype.send = function (callbacks) {
        nbLogger("PushSender.send()");
        var path = "/push/notifications";
        var request = new HttpRequest(this._service, path);
        request.setMethod("POST");
        request.setContentType("application/json");
        request.setData(this._toJson());
        var promise = request.execute().then(function (response) {
            nbLogger("PushSender.send#success : response = " + response);
            try {
                return JSON.parse(response);
            }
            catch (e) {
                nbLogger("PushSender.send#success : exception=" + e);
                var errorResult = _createError(0, "Invalid response from server", e);
                return Promise.reject(errorResult);
            }
        }, function (error) {
            nbLogger(("PushSender.send#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        return _promisify(promise, callbacks);
    };
    PushSenderBase.prototype._toJson = function () {
        var json = {};
        if (this._clause != null) {
            json.query = this._clause.json();
        }
        if (this._message != null) {
            json.message = this._message;
        }
        if (this._allowedReceivers != null) {
            json.allowedReceivers = this._allowedReceivers;
        }
        if (this._apnsFields != null) {
            this._copyKeys(this._apnsFields._fields, json);
        }
        if (this._gcmFields != null) {
            this._copyKeys(this._gcmFields._fields, json);
        }
        if (this._sseFields != null) {
            this._copyKeys(this._sseFields._fields, json);
        }
        return json;
    };
    PushSenderBase.prototype._copyKeys = function (from, to) {
        for (var _i = 0, _a = Object.keys(from); _i < _a.length; _i++) {
            var key = _a[_i];
            to[key] = from[key];
        }
    };
    Object.defineProperty(PushSenderBase.prototype, "clause", {
        get: function () {
            return this._clause;
        },
        set: function (clause) {
            if (!(clause instanceof Clause)) {
                throw new Error("PushSender.clause, Invalid type");
            }
            this._clause = clause;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PushSenderBase.prototype, "message", {
        get: function () {
            return this._message;
        },
        set: function (message) {
            if (typeof message !== "string") {
                throw new Error("PushSender.message, Not string: " + message);
            }
            this._message = message;
            nbLogger("push.message = " + this._message);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PushSenderBase.prototype, "allowedReceivers", {
        get: function () {
            return this._allowedReceivers;
        },
        set: function (receivers) {
            if (!Array.isArray(receivers)) {
                throw new Error("PushSender.allowedReceivers, Not Array");
            }
            this._allowedReceivers = receivers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PushSenderBase.prototype, "apnsFields", {
        get: function () {
            return this._apnsFields;
        },
        set: function (fields) {
            if (!(fields instanceof ApnsFields)) {
                throw new Error("PushSender.apnsFields, Invalid instance type");
            }
            this._apnsFields = fields;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PushSenderBase.prototype, "gcmFields", {
        get: function () {
            return this._gcmFields;
        },
        set: function (fields) {
            if (!(fields instanceof GcmFields)) {
                throw new Error("PushSender.gcmFields, Invalid instance type");
            }
            this._gcmFields = fields;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PushSenderBase.prototype, "sseFields", {
        get: function () {
            return this._sseFields;
        },
        set: function (fields) {
            if (!(fields instanceof SseFields)) {
                throw new Error("PushSender.sseFields, Invalid instance type");
            }
            this._sseFields = fields;
        },
        enumerable: true,
        configurable: true
    });
    PushSenderBase.ApnsFields = ApnsFields;
    PushSenderBase.GcmFields = GcmFields;
    PushSenderBase.SseFields = SseFields;
    return PushSenderBase;
}());
var declarePushSender = function (_service) {
    _service.PushSender = (function (_super) {
        __extends(PushSender, _super);
        function PushSender() {
            return _super.call(this, _service) || this;
        }
        return PushSender;
    }(PushSenderBase));
};
var BatchRequest = (function () {
    function BatchRequest() {
        this.requests = [];
        this.json = { "requests": this.requests };
    }
    BatchRequest.prototype.addInsertRequest = function (object) {
        if (object.etag) {
            throw new Error("ETag exists");
        }
        this.requests.push({ "op": "insert", "data": object });
    };
    BatchRequest.prototype.addUpdateRequest = function (object) {
        if (!object._id) {
            throw new Error("No id");
        }
        var req = { "op": "update", "_id": object._id, "data": { "$full_update": object } };
        if (object.etag) {
            req.etag = object.etag;
        }
        this.requests.push(req);
    };
    BatchRequest.prototype.addDeleteRequest = function (object) {
        if (!object._id) {
            throw new Error("No id");
        }
        var req = { "op": "delete", "_id": object._id };
        if (object.etag) {
            req.etag = object.etag;
        }
        this.requests.push(req);
    };
    return BatchRequest;
}());
var LocalStorageInMemory = (function () {
    function LocalStorageInMemory() {
        this.data = {};
    }
    LocalStorageInMemory.prototype.getItem = function (key) {
        return this.data[key];
    };
    LocalStorageInMemory.prototype.setItem = function (key, value) {
        this.data[key] = value;
    };
    LocalStorageInMemory.prototype.removeItem = function (key) {
        delete this.data[key];
    };
    return LocalStorageInMemory;
}());
var NebulaConfig = (function () {
    function NebulaConfig(params) {
        this.offline = false;
        this.allowSelfSignedCert = false;
        this.debugMode = "release";
        if (params !== null) {
            this.tenant = params.tenant;
            this.appId = params.appId;
            this.appKey = params.appKey;
            this.baseUri = params.baseUri;
            if (this.baseUri.slice(-1) === "/") {
                this.baseUri = this.baseUri.slice(0, -1);
            }
            if (params.offline !== undefined && params.offline === true) {
                this.offline = params.offline;
            }
            if (params.allowSelfSignedCert !== undefined && params.allowSelfSignedCert === true) {
                this.allowSelfSignedCert = params.allowSelfSignedCert;
            }
            if (params.serviceId !== undefined) {
                this.serviceId = params.serviceId;
            }
            if (params.debugMode !== undefined) {
                this.debugMode = params.debugMode;
            }
        }
    }
    return NebulaConfig;
}());
var NebulaService = (function () {
    function NebulaService() {
        this.BUCKET_MODE_ONLINE = 0;
        this.BUCKET_MODE_REPLICA = 1;
        this.BUCKET_MODE_LOCAL = 2;
        declareUser(this);
        declareGroup(this);
        declareObjectBucket(this);
        declareFileBucket(this);
        declareCustomApi(this);
        declarePushSender(this);
        this.NebulaService = NebulaService;
        this.HttpRequest = HttpRequest;
        this.AclPermission = AclPermission;
        this.AclGroup = AclGroup;
        this.Acl = Acl;
        this.RegexOption = RegexOption;
        this.Clause = Clause;
        this.ObjectQuery = ObjectQuery;
        this.FileMetadata = FileMetadata;
        this.BatchRequest = BatchRequest;
        this.AccountLink = AccountLink;
        this._SdeRequest = _SdeRequest;
        this._SdeNetworkEventListener = _SdeNetworkEventListener;
        this._SdeSyncEventListener = _SdeSyncEventListener;
    }
    NebulaService.prototype.getRestApiVersion = function () {
        return 1;
    };
    NebulaService.prototype.getTenantID = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.tenant;
        }
    };
    NebulaService.prototype.getBaseUri = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.baseUri;
        }
    };
    NebulaService.prototype.getAppID = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.appId;
        }
    };
    NebulaService.prototype.getAppKey = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.appKey;
        }
    };
    NebulaService.prototype.setAppKey = function (key) {
        if (!this._config) {
            throw new Error("Not initialized");
        }
        this._config.appKey = key;
        return this;
    };
    NebulaService.prototype.getServiceID = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.serviceId;
        }
    };
    NebulaService.prototype.getDebugMode = function () {
        if (this._config === undefined) {
            return null;
        }
        else {
            return this._config.debugMode;
        }
    };
    NebulaService.prototype.isOffline = function () {
        return this._config.offline;
    };
    NebulaService.prototype.isAllowSelfSignedCert = function () {
        return this._config.allowSelfSignedCert;
    };
    NebulaService.prototype.setClientCertificate = function (certInfo) {
        this._config.clientCertOptions = certInfo;
        return this;
    };
    NebulaService.prototype.isClientCertSet = function () {
        return (this._config.clientCertOptions != null);
    };
    NebulaService.prototype.getCurrentUser = function () {
        var _saveStr = this._localStorage.getItem(this._userItemKey());
        if (!_saveStr) {
            return null;
        }
        try {
            var _jsonObj = JSON.parse(_saveStr);
            if (!("expire" in _jsonObj) || _jsonObj.expire < new Date().getTime() / 1000) {
                _jsonObj = null;
            }
            return _jsonObj;
        }
        catch (e) {
            nbLogger("Nebula.getCurrentUser#" + e.message);
            return null;
        }
    };
    NebulaService.prototype.setCurrentUser = function (user) {
        var _saveObj = {
            _id: user.get("_id"),
            username: user.get("username"),
            email: user.get("email"),
            sessionToken: user.get("sessionToken"),
            expire: user.get("expire"),
            options: user.get("options"),
            groups: user.get("groups")
        };
        this._localStorage.setItem(this._userItemKey(), JSON.stringify(_saveObj));
        return this;
    };
    NebulaService.prototype.setSessionToken = function (sessionToken) {
        var expire = new Date().getTime() / 1000 + (60 * 60 * 24 * 365 * 100);
        var _json = this.getCurrentUser();
        if (_json === null) {
            _json = {
                _id: "",
                username: "",
                email: "",
                sessionToken: sessionToken,
                expire: expire,
                options: {},
                groups: []
            };
        }
        else {
            _json.sessionToken = sessionToken;
            _json.expire = expire;
        }
        this._localStorage.setItem(this._userItemKey(), JSON.stringify(_json));
        return this;
    };
    NebulaService.prototype.removeCurrentUser = function () {
        this._localStorage.removeItem(this._userItemKey());
        return this;
    };
    NebulaService.prototype._userItemKey = function () {
        var serviceId = this.getServiceID();
        if (serviceId !== undefined) {
            return this.getTenantID() + "_" + this.getAppID() + "_" + serviceId;
        }
        else {
            return this.getTenantID() + "_" + this.getAppID();
        }
    };
    NebulaService.prototype.initialize = function (params) {
        var _this = this;
        this._config = new NebulaConfig(params);
        if (localStorage != null) {
            this._localStorage = localStorage;
        }
        else {
            this._localStorage = new LocalStorageInMemory();
        }
        if (this._config.offline) {
            if (this !== Nebula) {
                throw new Error("No offline mode supported for multi-tenant instance.");
            }
            try {
                var request = new _SdeRequest("Nebula", "initialize");
                var initializeParams = {
                    tenant: this.getTenantID(),
                    appId: this.getAppID(),
                    appKey: this.getAppKey(),
                    baseUri: this.getBaseUri(),
                    offline: this.isOffline(),
                    allowSelfSignedCert: this.isAllowSelfSignedCert(),
                    debugMode: this.getDebugMode()
                };
                request.setData(initializeParams);
                request.execute().then(function (response) {
                    nbLogger("Nebula.initialize#Success");
                    return nbLogger("Nebula.initialize#response = " + response);
                }).catch(function (error) {
                    nbLogger("Nebula.initialize#Error = " + _errorText(error));
                    return _this._config.offline = false;
                });
            }
            catch (e) {
                nbLogger("Nebula.initialize#" + e.message);
                this._config.offline = false;
            }
        }
        return this;
    };
    NebulaService.prototype.setLoginCacheValidTime = function (expire, callbacks) {
        nbLogger("Nebula.setLoginCacheValidTime#start");
        if (expire <= 0) {
            throw new Error("Nebula.setLoginCacheValidTime: bad expire");
        }
        if (!this.isOffline()) {
            throw new Error("Not offline mode!");
        }
        var request = new _SdeRequest("Nebula", "setLoginCacheValidTime");
        var setLoginCacheValidTimeParams = {
            expire: expire
        };
        request.setData(setLoginCacheValidTimeParams);
        var promise = request.execute().then(function () {
            nbLogger("Nebula.setLoginCacheValidTime#Success");
            return;
        }).catch(function (error) {
            nbLogger(("Nebula.setLoginCacheValidTime#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("Nebula.setLoginCacheValidTime#end");
        return _promisify(promise, callbacks);
    };
    NebulaService.prototype.getLoginCacheValidTime = function (callbacks) {
        nbLogger("Nebula.getLoginCacheValidTime#start");
        if (!this.isOffline()) {
            throw new Error("Not offline mode!");
        }
        var request = new _SdeRequest("Nebula", "getLoginCacheValidTime");
        var promise = request.execute().then(function (response) {
            nbLogger("Nebula.getLoginCacheValidTime#Success");
            var jsonObj;
            try {
                jsonObj = JSON.parse(response);
            }
            catch (e) {
                nbError("Nebula.getLoginCacheValidTime#" + e.message);
                jsonObj = null;
            }
            if (jsonObj !== null) {
                return jsonObj.expire;
            }
            else {
                var error = _createError(400, "Bad Response", "Response json error.");
                return Promise.reject(error);
            }
        }).catch(function (error) {
            nbLogger("Nebula.getLoginCacheValidTime#error callback start");
            nbLogger(("Nebula.getLoginCacheValidTime#error = " + (_errorText(error))));
            return Promise.reject(error);
        });
        nbLogger("Nebula.getLoginCacheValidTime#end");
        return _promisify(promise, callbacks);
    };
    NebulaService.prototype.setNetworkEventListener = function (listener) {
        nbLogger("Nebula.setNetworkEventListener#start");
        var paramOk = false;
        if (arguments.length === 1) {
            if (listener != null) {
                if (listener.onNetworkStateChanged !== undefined) {
                    paramOk = true;
                }
            }
            if (listener === null) {
                paramOk = true;
            }
        }
        if (!paramOk) {
            nbError("Nebula.setNetworkEventListener#invalid parameter.");
            return;
        }
        if (this.isOffline()) {
            _SdeNetworkEventListener.setCallback(listener);
        }
        else {
            nbLogger("Nebula.setNetworkEventListener#Disabled Offline");
        }
        nbLogger("Nebula.setNetworkEventListener#end");
        return this;
    };
    NebulaService.prototype.setHttpProxy = function (proxy) {
        var agent = null;
        if (proxy != null) {
            this.verifyProxy(proxy);
            agent = require('tunnel').httpOverHttp({ proxy: proxy });
        }
        HttpRequest.setHttpAgent(agent);
    };
    NebulaService.prototype.setHttpsProxy = function (proxy, options) {
        var agent = null;
        if (proxy != null) {
            if (options == null) {
                options = {};
            }
            options.proxy = proxy;
            this.verifyProxy(proxy);
            agent = require('tunnel').httpsOverHttp(options);
            agent.defaultPort = 443;
        }
        HttpRequest.setHttpsAgent(agent, options);
    };
    NebulaService.prototype.verifyProxy = function (proxy) {
        if (typeof proxy !== 'object') {
            throw new Error("Bad proxy: not object");
        }
        if (proxy.host == null || typeof proxy.host !== "string") {
            throw new Error("Bad proxy: host");
        }
        if (proxy.port == null || typeof proxy.port !== "number") {
            throw new Error("Bad proxy: port");
        }
    };
    return NebulaService;
}());
var Nebula = new NebulaService();
if (typeof exports === 'object' && typeof module !== "undefined") {
    module.exports = Nebula;
}
else {
    root.Nebula = Nebula;
}

}).call(this); 
