var HavokPhysics = (() => {
  var _scriptDir = import.meta.url;

  return function (HavokPhysics) {
    HavokPhysics = HavokPhysics || {};

    var Module = typeof HavokPhysics != "undefined" ? HavokPhysics : {};
    var readyPromiseResolve, readyPromiseReject;
    Module["ready"] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = true;
    var ENVIRONMENT_IS_WORKER = false;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1,
        );
      } else {
        scriptDirectory = "";
      }
      {
        read_ = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = (url, onload, onerror) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = (title) => (document.title = title);
    } else {
    }
    var out = Module["print"] || console.log.bind(console);
    var err = Module["printErr"] || console.warn.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module["arguments"]) arguments_ = Module["arguments"];
    if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
    if (Module["quit"]) quit_ = Module["quit"];
    var POINTER_SIZE = 4;
    var wasmBinary;
    if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
    var noExitRuntime = Module["noExitRuntime"] || true;
    if (typeof WebAssembly != "object") {
      abort("no native wasm support detected");
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    var UTF8Decoder =
      typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 =
            ((u0 & 7) << 18) |
            (u1 << 12) |
            (u2 << 6) |
            (heapOrArray[idx++] & 63);
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | (u >> 6);
          heap[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | (u >> 12);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | (u >> 18);
          heap[outIdx++] = 128 | ((u >> 12) & 63);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    }
    var buffer,
      HEAP8,
      HEAPU8,
      HEAP16,
      HEAPU16,
      HEAP32,
      HEAPU32,
      HEAPF32,
      HEAP64,
      HEAPU64,
      HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module["HEAP8"] = HEAP8 = new Int8Array(buf);
      Module["HEAP16"] = HEAP16 = new Int16Array(buf);
      Module["HEAP32"] = HEAP32 = new Int32Array(buf);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
      Module["HEAP64"] = HEAP64 = new BigInt64Array(buf);
      Module["HEAPU64"] = HEAPU64 = new BigUint64Array(buf);
    }
    var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function keepRuntimeAlive() {
      return noExitRuntime;
    }
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
          Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
          Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      {
        if (Module["onAbort"]) {
          Module["onAbort"](what);
        }
      }
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    var wasmBinaryFile;
    if (Module["locateFile"]) {
      wasmBinaryFile = "HavokPhysics.wasm?init";
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
    } else {
      wasmBinaryFile = new URL("HavokPhysics.wasm?init", import.meta.url).toString();
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw "both async and sync fetching of the wasm failed";
      } catch (err) {
        abort(err);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" })
            .then(function (response) {
              if (!response["ok"]) {
                throw (
                  "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                );
              }
              return response["arrayBuffer"]();
            })
            .catch(function () {
              return getBinary(wasmBinaryFile);
            });
        }
      }
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { env: asmLibraryArg, wasi_snapshot_preview1: asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmMemory = Module["asm"]["memory"];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module["asm"]["__indirect_function_table"];
        addOnInit(Module["asm"]["__wasm_call_ctors"]);
        removeRunDependency("wasm-instantiate");
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info);
          })
          .then(function (instance) {
            return instance;
          })
          .then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason);
          });
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming == "function" &&
          !isDataURI(wasmBinaryFile) &&
          typeof fetch == "function"
        ) {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(
            function (response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(
                receiveInstantiationResult,
                function (reason) {
                  err("wasm streaming compile failed: " + reason);
                  err("falling back to ArrayBuffer instantiation");
                  return instantiateArrayBuffer(receiveInstantiationResult);
                },
              );
            },
          );
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module["instantiateWasm"]) {
        try {
          var exports = Module["instantiateWasm"](info, receiveInstance);
          return exports;
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          readyPromiseReject(e);
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    }
    function demangle(func) {
      return func;
    }
    function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]";
      });
    }
    function handleException(e) {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
    function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        try {
          throw new Error();
        } catch (e) {
          error = e;
        }
        if (!error.stack) {
          return "(no stack trace available)";
        }
      }
      return error.stack.toString();
    }
    var tupleRegistrations = {};
    function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
    function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAP32[pointer >> 2]);
    }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name) {
      if (undefined === name) {
        return "_unknown";
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return "_" + name;
      }
      return name;
    }
    function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return new Function(
        "body",
        "return function " +
          name +
          "() {\n" +
          '    "use strict";' +
          "    return body.apply(this, arguments);\n" +
          "};\n",
      )(body);
    }
    function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function (message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== undefined) {
          this.stack =
            this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function () {
        if (this.message === undefined) {
          return this.name;
        } else {
          return this.name + ": " + this.message;
        }
      };
      return errorClass;
    }
    var InternalError = undefined;
    function throwInternalError(message) {
      throw new InternalError(message);
    }
    function whenDependentTypesAreResolved(
      myTypes,
      dependentTypes,
      getTypeConverters,
    ) {
      myTypes.forEach(function (type) {
        typeDependencies[type] = dependentTypes;
      });
      function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError("Mismatched type converter count");
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
    function __embind_finalize_value_array(rawTupleType) {
      var reg = tupleRegistrations[rawTupleType];
      delete tupleRegistrations[rawTupleType];
      var elements = reg.elements;
      var elementsLength = elements.length;
      var elementTypes = elements
        .map(function (elt) {
          return elt.getterReturnType;
        })
        .concat(
          elements.map(function (elt) {
            return elt.setterArgumentType;
          }),
        );
      var rawConstructor = reg.rawConstructor;
      var rawDestructor = reg.rawDestructor;
      whenDependentTypesAreResolved(
        [rawTupleType],
        elementTypes,
        function (elementTypes) {
          elements.forEach((elt, i) => {
            var getterReturnType = elementTypes[i];
            var getter = elt.getter;
            var getterContext = elt.getterContext;
            var setterArgumentType = elementTypes[i + elementsLength];
            var setter = elt.setter;
            var setterContext = elt.setterContext;
            elt.read = (ptr) => {
              return getterReturnType["fromWireType"](
                getter(getterContext, ptr),
              );
            };
            elt.write = (ptr, o) => {
              var destructors = [];
              setter(
                setterContext,
                ptr,
                setterArgumentType["toWireType"](destructors, o),
              );
              runDestructors(destructors);
            };
          });
          return [
            {
              name: reg.name,
              fromWireType: function (ptr) {
                var rv = new Array(elementsLength);
                for (var i = 0; i < elementsLength; ++i) {
                  rv[i] = elements[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
              },
              toWireType: function (destructors, o) {
                if (elementsLength !== o.length) {
                  throw new TypeError(
                    "Incorrect number of tuple elements for " +
                      reg.name +
                      ": expected=" +
                      elementsLength +
                      ", actual=" +
                      o.length,
                  );
                }
                var ptr = rawConstructor();
                for (var i = 0; i < elementsLength; ++i) {
                  elements[i].write(ptr, o[i]);
                }
                if (destructors !== null) {
                  destructors.push(rawDestructor, ptr);
                }
                return ptr;
              },
              argPackAdvance: 8,
              readValueFromPointer: simpleReadValueFromPointer,
              destructorFunction: rawDestructor,
            },
          ];
        },
      );
    }
    function embindRepr(v) {
      if (v === null) {
        return "null";
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
        return v.toString();
      } else {
        return "" + v;
      }
    }
    function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
    var embind_charCodes = undefined;
    function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
    var BindingError = undefined;
    function throwBindingError(message) {
      throw new BindingError(message);
    }
    function registerType(rawType, registeredInstance, options = {}) {
      if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError(
          "registerType registeredInstance requires argPackAdvance",
        );
      }
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(
          'type "' + name + '" must have a positive integer typeid pointer',
        );
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError("Cannot register type '" + name + "' twice");
        }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
    function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return signed
            ? function readS8FromPointer(pointer) {
                return HEAP8[pointer];
              }
            : function readU8FromPointer(pointer) {
                return HEAPU8[pointer];
              };
        case 1:
          return signed
            ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1];
              }
            : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1];
              };
        case 2:
          return signed
            ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2];
              }
            : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2];
              };
        case 3:
          return signed
            ? function readS64FromPointer(pointer) {
                return HEAP64[pointer >> 3];
              }
            : function readU64FromPointer(pointer) {
                return HEAPU64[pointer >> 3];
              };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_bigint(
      primitiveType,
      name,
      size,
      minRange,
      maxRange,
    ) {
      name = readLatin1String(name);
      var shift = getShiftFromSize(size);
      var isUnsignedType = name.indexOf("u") != -1;
      if (isUnsignedType) {
        maxRange = (1n << 64n) - 1n;
      }
      registerType(primitiveType, {
        name: name,
        fromWireType: function (value) {
          return value;
        },
        toWireType: function (destructors, value) {
          if (typeof value != "bigint" && typeof value != "number") {
            throw new TypeError(
              'Cannot convert "' + embindRepr(value) + '" to ' + this.name,
            );
          }
          if (value < minRange || value > maxRange) {
            throw new TypeError(
              'Passing a number "' +
                embindRepr(value) +
                '" from JS side to C/C++ side to an argument of type "' +
                name +
                '", which is outside the valid range [' +
                minRange +
                ", " +
                maxRange +
                "]!",
            );
          }
          return value;
        },
        argPackAdvance: 8,
        readValueFromPointer: integerReadValueFromPointer(
          name,
          shift,
          !isUnsignedType,
        ),
        destructorFunction: null,
      });
    }
    function getShiftFromSize(size) {
      switch (size) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + size);
      }
    }
    function __embind_register_bool(
      rawType,
      name,
      size,
      trueValue,
      falseValue,
    ) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function (wt) {
          return !!wt;
        },
        toWireType: function (destructors, o) {
          return o ? trueValue : falseValue;
        },
        argPackAdvance: 8,
        readValueFromPointer: function (pointer) {
          var heap;
          if (size === 1) {
            heap = HEAP8;
          } else if (size === 2) {
            heap = HEAP16;
          } else if (size === 4) {
            heap = HEAP32;
          } else {
            throw new TypeError("Unknown boolean type size: " + name);
          }
          return this["fromWireType"](heap[pointer >> shift]);
        },
        destructorFunction: null,
      });
    }
    var emval_free_list = [];
    var emval_handle_array = [
      {},
      { value: undefined },
      { value: null },
      { value: true },
      { value: false },
    ];
    function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
      }
    }
    function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          ++count;
        }
      }
      return count;
    }
    function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          return emval_handle_array[i];
        }
      }
      return null;
    }
    function init_emval() {
      Module["count_emval_handles"] = count_emval_handles;
      Module["get_first_emval"] = get_first_emval;
    }
    var Emval = {
      toValue: (handle) => {
        if (!handle) {
          throwBindingError("Cannot use deleted val. handle = " + handle);
        }
        return emval_handle_array[handle].value;
      },
      toHandle: (value) => {
        switch (value) {
          case undefined:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default: {
            var handle = emval_free_list.length
              ? emval_free_list.pop()
              : emval_handle_array.length;
            emval_handle_array[handle] = { refcount: 1, value: value };
            return handle;
          }
        }
      },
    };
    function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function (handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        },
        toWireType: function (destructors, value) {
          return Emval.toHandle(value);
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: null,
      });
    }
    function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function () {
          if (
            !proto[methodName].overloadTable.hasOwnProperty(arguments.length)
          ) {
            throwBindingError(
              "Function '" +
                humanName +
                "' called with an invalid number of arguments (" +
                arguments.length +
                ") - expects one of (" +
                proto[methodName].overloadTable +
                ")!",
            );
          }
          return proto[methodName].overloadTable[arguments.length].apply(
            this,
            arguments,
          );
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
    function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
        if (
          undefined === numArguments ||
          (undefined !== Module[name].overloadTable &&
            undefined !== Module[name].overloadTable[numArguments])
        ) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
          throwBindingError(
            "Cannot register multiple overloads of a function with the same number of arguments (" +
              numArguments +
              ")!",
          );
        }
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        if (undefined !== numArguments) {
          Module[name].numArguments = numArguments;
        }
      }
    }
    function enumReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return function (pointer) {
            var heap = signed ? HEAP8 : HEAPU8;
            return this["fromWireType"](heap[pointer]);
          };
        case 1:
          return function (pointer) {
            var heap = signed ? HEAP16 : HEAPU16;
            return this["fromWireType"](heap[pointer >> 1]);
          };
        case 2:
          return function (pointer) {
            var heap = signed ? HEAP32 : HEAPU32;
            return this["fromWireType"](heap[pointer >> 2]);
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_enum(rawType, name, size, isSigned) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      function ctor() {}
      ctor.values = {};
      registerType(rawType, {
        name: name,
        constructor: ctor,
        fromWireType: function (c) {
          return this.constructor.values[c];
        },
        toWireType: function (destructors, c) {
          return c.value;
        },
        argPackAdvance: 8,
        readValueFromPointer: enumReadValueFromPointer(name, shift, isSigned),
        destructorFunction: null,
      });
      exposePublicSymbol(name, ctor);
    }
    function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
    function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
        throwBindingError(
          humanName + " has unknown type " + getTypeName(rawType),
        );
      }
      return impl;
    }
    function __embind_register_enum_value(rawEnumType, name, enumValue) {
      var enumType = requireRegisteredType(rawEnumType, "enum");
      name = readLatin1String(name);
      var Enum = enumType.constructor;
      var Value = Object.create(enumType.constructor.prototype, {
        value: { value: enumValue },
        constructor: {
          value: createNamedFunction(
            enumType.name + "_" + name,
            function () {},
          ),
        },
      });
      Enum.values[enumValue] = Value;
      Enum[name] = Value;
    }
    function floatReadValueFromPointer(name, shift) {
      switch (shift) {
        case 2:
          return function (pointer) {
            return this["fromWireType"](HEAPF32[pointer >> 2]);
          };
        case 3:
          return function (pointer) {
            return this["fromWireType"](HEAPF64[pointer >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + name);
      }
    }
    function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function (value) {
          return value;
        },
        toWireType: function (destructors, value) {
          return value;
        },
        argPackAdvance: 8,
        readValueFromPointer: floatReadValueFromPointer(name, shift),
        destructorFunction: null,
      });
    }
    function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError(
          "new_ called with constructor type " +
            typeof constructor +
            " which is not a function",
        );
      }
      var dummy = createNamedFunction(
        constructor.name || "unknownFunctionName",
        function () {},
      );
      dummy.prototype = constructor.prototype;
      var obj = new dummy();
      var r = constructor.apply(obj, argumentList);
      return r instanceof Object ? r : obj;
    }
    function craftInvokerFunction(
      humanName,
      argTypes,
      classType,
      cppInvokerFunc,
      cppTargetFunc,
    ) {
      var argCount = argTypes.length;
      if (argCount < 2) {
        throwBindingError(
          "argTypes array size mismatch! Must at least get return value and 'this' types!",
        );
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i = 1; i < argTypes.length; ++i) {
        if (
          argTypes[i] !== null &&
          argTypes[i].destructorFunction === undefined
        ) {
          needsDestructorStack = true;
          break;
        }
      }
      var returns = argTypes[0].name !== "void";
      var argsList = "";
      var argsListWired = "";
      for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
      }
      var invokerFnBody =
        "return function " +
        makeLegalFunctionName(humanName) +
        "(" +
        argsList +
        ") {\n" +
        "if (arguments.length !== " +
        (argCount - 2) +
        ") {\n" +
        "throwBindingError('function " +
        humanName +
        " called with ' + arguments.length + ' arguments, expected " +
        (argCount - 2) +
        " args!');\n" +
        "}\n";
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = [
        "throwBindingError",
        "invoker",
        "fn",
        "runDestructors",
        "retType",
        "classParam",
      ];
      var args2 = [
        throwBindingError,
        cppInvokerFunc,
        cppTargetFunc,
        runDestructors,
        argTypes[0],
        argTypes[1],
      ];
      if (isClassMethodFunc) {
        invokerFnBody +=
          "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
      }
      for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody +=
          "var arg" +
          i +
          "Wired = argType" +
          i +
          ".toWireType(" +
          dtorStack +
          ", arg" +
          i +
          "); // " +
          argTypes[i + 2].name +
          "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2]);
      }
      if (isClassMethodFunc) {
        argsListWired =
          "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
      invokerFnBody +=
        (returns ? "var rv = " : "") +
        "invoker(fn" +
        (argsListWired.length > 0 ? ", " : "") +
        argsListWired +
        ");\n";
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
          var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody +=
              paramName +
              "_dtor(" +
              paramName +
              "); // " +
              argTypes[i].name +
              "\n";
            args1.push(paramName + "_dtor");
            args2.push(argTypes[i].destructorFunction);
          }
        }
      }
      if (returns) {
        invokerFnBody +=
          "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
      } else {
      }
      invokerFnBody += "}\n";
      args1.push(invokerFnBody);
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }
    function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
        array.push(HEAPU32[(firstElement + i * 4) >> 2]);
      }
      return array;
    }
    function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
      }
      if (
        undefined !== Module[name].overloadTable &&
        undefined !== numArguments
      ) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    }
    var wasmTableMirror = [];
    function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length)
          wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    }
    function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
      function makeDynCaller() {
        return getWasmTableEntry(rawFunction);
      }
      var fp = makeDynCaller();
      if (typeof fp != "function") {
        throwBindingError(
          "unknown function pointer with signature " +
            signature +
            ": " +
            rawFunction,
        );
      }
      return fp;
    }
    var UnboundTypeError = undefined;
    function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
      throw new UnboundTypeError(
        message + ": " + unboundTypes.map(getTypeName).join([", "]),
      );
    }
    function __embind_register_function(
      name,
      argCount,
      rawArgTypesAddr,
      signature,
      rawInvoker,
      fn,
    ) {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = readLatin1String(name);
      rawInvoker = embind__requireFunction(signature, rawInvoker);
      exposePublicSymbol(
        name,
        function () {
          throwUnboundTypeError(
            "Cannot call " + name + " due to unbound types",
            argTypes,
          );
        },
        argCount - 1,
      );
      whenDependentTypesAreResolved([], argTypes, function (argTypes) {
        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
        replacePublicSymbol(
          name,
          craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn),
          argCount - 1,
        );
        return [];
      });
    }
    function __embind_register_integer(
      primitiveType,
      name,
      size,
      minRange,
      maxRange,
    ) {
      name = readLatin1String(name);
      if (maxRange === -1) {
        maxRange = 4294967295;
      }
      var shift = getShiftFromSize(size);
      var fromWireType = (value) => value;
      if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = (value) => (value << bitshift) >>> bitshift;
      }
      var isUnsignedType = name.includes("unsigned");
      var checkAssertions = (value, toTypeName) => {};
      var toWireType;
      if (isUnsignedType) {
        toWireType = function (destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        };
      } else {
        toWireType = function (destructors, value) {
          checkAssertions(value, this.name);
          return value;
        };
      }
      registerType(primitiveType, {
        name: name,
        fromWireType: fromWireType,
        toWireType: toWireType,
        argPackAdvance: 8,
        readValueFromPointer: integerReadValueFromPointer(
          name,
          shift,
          minRange !== 0,
        ),
        destructorFunction: null,
      });
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
      ];
      var TA = typeMapping[dataTypeIndex];
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(buffer, data, size);
      }
      name = readLatin1String(name);
      registerType(
        rawType,
        {
          name: name,
          fromWireType: decodeMemoryView,
          argPackAdvance: 8,
          readValueFromPointer: decodeMemoryView,
        },
        { ignoreDuplicateRegistrations: true },
      );
    }
    function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, {
        name: name,
        fromWireType: function (value) {
          var length = HEAPU32[value >> 2];
          var payload = value + 4;
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join("");
          }
          _free(value);
          return str;
        },
        toWireType: function (destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
          var length;
          var valueIsOfTypeString = typeof value == "string";
          if (
            !(
              valueIsOfTypeString ||
              value instanceof Uint8Array ||
              value instanceof Uint8ClampedArray ||
              value instanceof Int8Array
            )
          ) {
            throwBindingError("Cannot pass non-string to std::string");
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[base >> 2] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError(
                    "String has UTF-16 code units that do not fit in 8 bits",
                  );
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: function (ptr) {
          _free(ptr);
        },
      });
    }
    var UTF16Decoder =
      typeof TextDecoder != "undefined"
        ? new TextDecoder("utf-16le")
        : undefined;
    function UTF16ToString(ptr, maxBytesToRead) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      var str = "";
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[(ptr + i * 2) >> 1];
        if (codeUnit == 0) break;
        str += String.fromCharCode(codeUnit);
      }
      return str;
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite =
        maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF16(str) {
      return str.length * 2;
    }
    function UTF32ToString(ptr, maxBytesToRead) {
      var i = 0;
      var str = "";
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(ptr + i * 4) >> 2];
        if (utf32 == 0) break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit =
            (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
        len += 4;
      }
      return len;
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = () => HEAPU16;
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = () => HEAPU32;
        shift = 2;
      }
      registerType(rawType, {
        name: name,
        fromWireType: function (value) {
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
          var decodeStartPtr = value + 4;
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
          _free(value);
          return str;
        },
        toWireType: function (destructors, value) {
          if (!(typeof value == "string")) {
            throwBindingError(
              "Cannot pass non-string to C++ string type " + name,
            );
          }
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
          encodeString(value, ptr + 4, length + charSize);
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: function (ptr) {
          _free(ptr);
        },
      });
    }
    function __embind_register_value_array(
      rawType,
      name,
      constructorSignature,
      rawConstructor,
      destructorSignature,
      rawDestructor,
    ) {
      tupleRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: embind__requireFunction(
          constructorSignature,
          rawConstructor,
        ),
        rawDestructor: embind__requireFunction(
          destructorSignature,
          rawDestructor,
        ),
        elements: [],
      };
    }
    function __embind_register_value_array_element(
      rawTupleType,
      getterReturnType,
      getterSignature,
      getter,
      getterContext,
      setterArgumentType,
      setterSignature,
      setter,
      setterContext,
    ) {
      tupleRegistrations[rawTupleType].elements.push({
        getterReturnType: getterReturnType,
        getter: embind__requireFunction(getterSignature, getter),
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: embind__requireFunction(setterSignature, setter),
        setterContext: setterContext,
      });
    }
    function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        isVoid: true,
        name: name,
        argPackAdvance: 0,
        fromWireType: function () {
          return undefined;
        },
        toWireType: function (destructors, o) {
          return undefined;
        },
      });
    }
    var nowIsMonotonic = true;
    function __emscripten_get_now_is_monotonic() {
      return nowIsMonotonic;
    }
    var emval_symbols = {};
    function getStringOrSymbol(address) {
      var symbol = emval_symbols[address];
      if (symbol === undefined) {
        return readLatin1String(address);
      }
      return symbol;
    }
    var emval_methodCallers = [];
    function __emval_call_void_method(caller, handle, methodName, args) {
      caller = emval_methodCallers[caller];
      handle = Emval.toValue(handle);
      methodName = getStringOrSymbol(methodName);
      caller(handle, methodName, null, args);
    }
    function emval_addMethodCaller(caller) {
      var id = emval_methodCallers.length;
      emval_methodCallers.push(caller);
      return id;
    }
    function emval_lookupTypes(argCount, argTypes) {
      var a = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(
          HEAPU32[(argTypes + i * POINTER_SIZE) >> 2],
          "parameter " + i,
        );
      }
      return a;
    }
    var emval_registeredMethods = [];
    function __emval_get_method_caller(argCount, argTypes) {
      var types = emval_lookupTypes(argCount, argTypes);
      var retType = types[0];
      var signatureName =
        retType.name +
        "_$" +
        types
          .slice(1)
          .map(function (t) {
            return t.name;
          })
          .join("_") +
        "$";
      var returnId = emval_registeredMethods[signatureName];
      if (returnId !== undefined) {
        return returnId;
      }
      var params = ["retType"];
      var args = [retType];
      var argsList = "";
      for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        params.push("argType" + i);
        args.push(types[1 + i]);
      }
      var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
      var functionBody =
        "return function " +
        functionName +
        "(handle, name, destructors, args) {\n";
      var offset = 0;
      for (var i = 0; i < argCount - 1; ++i) {
        functionBody +=
          "    var arg" +
          i +
          " = argType" +
          i +
          ".readValueFromPointer(args" +
          (offset ? "+" + offset : "") +
          ");\n";
        offset += types[i + 1]["argPackAdvance"];
      }
      functionBody += "    var rv = handle[name](" + argsList + ");\n";
      for (var i = 0; i < argCount - 1; ++i) {
        if (types[i + 1]["deleteObject"]) {
          functionBody += "    argType" + i + ".deleteObject(arg" + i + ");\n";
        }
      }
      if (!retType.isVoid) {
        functionBody += "    return retType.toWireType(destructors, rv);\n";
      }
      functionBody += "};\n";
      params.push(functionBody);
      var invokerFunction = new_(Function, params).apply(null, args);
      returnId = emval_addMethodCaller(invokerFunction);
      emval_registeredMethods[signatureName] = returnId;
      return returnId;
    }
    function _abort() {
      abort("");
    }
    function _emscripten_date_now() {
      return Date.now();
    }
    function getHeapMax() {
      return 2147483648;
    }
    function _emscripten_get_heap_max() {
      return getHeapMax();
    }
    var _emscripten_get_now;
    _emscripten_get_now = () => performance.now();
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
      } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      let alignUp = (x, multiple) =>
        x + ((multiple - (x % multiple)) % multiple);
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(
          overGrownHeapSize,
          requestedSize + 100663296,
        );
        var newSize = Math.min(
          maxHeapSize,
          alignUp(Math.max(requestedSize, overGrownHeapSize), 65536),
        );
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    var printCharBuffers = [null, [], []];
    function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
    var SYSCALLS = {
      varargs: undefined,
      get: function () {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
      },
      getStr: function (ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
    };
    function _fd_write(fd, iov, iovcnt, pnum) {
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr + j]);
        }
        num += len;
      }
      HEAPU32[pnum >> 2] = num;
      return 0;
    }
    function _proc_exit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module["onExit"]) Module["onExit"](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
    function exitJS(status, implicit) {
      EXITSTATUS = status;
      _proc_exit(status);
    }
    InternalError = Module["InternalError"] = extendError(
      Error,
      "InternalError",
    );
    embind_init_charCodes();
    BindingError = Module["BindingError"] = extendError(Error, "BindingError");
    init_emval();
    UnboundTypeError = Module["UnboundTypeError"] = extendError(
      Error,
      "UnboundTypeError",
    );
    var asmLibraryArg = {
      _embind_finalize_value_array: __embind_finalize_value_array,
      _embind_register_bigint: __embind_register_bigint,
      _embind_register_bool: __embind_register_bool,
      _embind_register_emval: __embind_register_emval,
      _embind_register_enum: __embind_register_enum,
      _embind_register_enum_value: __embind_register_enum_value,
      _embind_register_float: __embind_register_float,
      _embind_register_function: __embind_register_function,
      _embind_register_integer: __embind_register_integer,
      _embind_register_memory_view: __embind_register_memory_view,
      _embind_register_std_string: __embind_register_std_string,
      _embind_register_std_wstring: __embind_register_std_wstring,
      _embind_register_value_array: __embind_register_value_array,
      _embind_register_value_array_element:
        __embind_register_value_array_element,
      _embind_register_void: __embind_register_void,
      _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
      _emval_call_void_method: __emval_call_void_method,
      _emval_decref: __emval_decref,
      _emval_get_method_caller: __emval_get_method_caller,
      abort: _abort,
      emscripten_date_now: _emscripten_date_now,
      emscripten_get_heap_max: _emscripten_get_heap_max,
      emscripten_get_now: _emscripten_get_now,
      emscripten_memcpy_big: _emscripten_memcpy_big,
      emscripten_resize_heap: _emscripten_resize_heap,
      fd_write: _fd_write,
    };
    var asm = createWasm();
    var ___wasm_call_ctors = (Module["___wasm_call_ctors"] = function () {
      return (___wasm_call_ctors = Module["___wasm_call_ctors"] =
        Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
    });
    var _HP_GetStatistics = (Module["_HP_GetStatistics"] = function () {
      return (_HP_GetStatistics = Module["_HP_GetStatistics"] =
        Module["asm"]["HP_GetStatistics"]).apply(null, arguments);
    });
    var _HP_Shape_CreateSphere = (Module["_HP_Shape_CreateSphere"] =
      function () {
        return (_HP_Shape_CreateSphere = Module["_HP_Shape_CreateSphere"] =
          Module["asm"]["HP_Shape_CreateSphere"]).apply(null, arguments);
      });
    var _HP_Shape_CreateCapsule = (Module["_HP_Shape_CreateCapsule"] =
      function () {
        return (_HP_Shape_CreateCapsule = Module["_HP_Shape_CreateCapsule"] =
          Module["asm"]["HP_Shape_CreateCapsule"]).apply(null, arguments);
      });
    var _HP_Shape_CreateCylinder = (Module["_HP_Shape_CreateCylinder"] =
      function () {
        return (_HP_Shape_CreateCylinder = Module["_HP_Shape_CreateCylinder"] =
          Module["asm"]["HP_Shape_CreateCylinder"]).apply(null, arguments);
      });
    var _HP_Shape_CreateBox = (Module["_HP_Shape_CreateBox"] = function () {
      return (_HP_Shape_CreateBox = Module["_HP_Shape_CreateBox"] =
        Module["asm"]["HP_Shape_CreateBox"]).apply(null, arguments);
    });
    var _HP_Shape_CreateConvexHull = (Module["_HP_Shape_CreateConvexHull"] =
      function () {
        return (_HP_Shape_CreateConvexHull = Module[
          "_HP_Shape_CreateConvexHull"
        ] =
          Module["asm"]["HP_Shape_CreateConvexHull"]).apply(null, arguments);
      });
    var _HP_Shape_CreateMesh = (Module["_HP_Shape_CreateMesh"] = function () {
      return (_HP_Shape_CreateMesh = Module["_HP_Shape_CreateMesh"] =
        Module["asm"]["HP_Shape_CreateMesh"]).apply(null, arguments);
    });
    var _HP_Shape_CreateHeightField = (Module["_HP_Shape_CreateHeightField"] =
      function () {
        return (_HP_Shape_CreateHeightField = Module[
          "_HP_Shape_CreateHeightField"
        ] =
          Module["asm"]["HP_Shape_CreateHeightField"]).apply(null, arguments);
      });
    var _HP_Shape_CreateContainer = (Module["_HP_Shape_CreateContainer"] =
      function () {
        return (_HP_Shape_CreateContainer = Module[
          "_HP_Shape_CreateContainer"
        ] =
          Module["asm"]["HP_Shape_CreateContainer"]).apply(null, arguments);
      });
    var _HP_Shape_Release = (Module["_HP_Shape_Release"] = function () {
      return (_HP_Shape_Release = Module["_HP_Shape_Release"] =
        Module["asm"]["HP_Shape_Release"]).apply(null, arguments);
    });
    var _HP_Shape_GetType = (Module["_HP_Shape_GetType"] = function () {
      return (_HP_Shape_GetType = Module["_HP_Shape_GetType"] =
        Module["asm"]["HP_Shape_GetType"]).apply(null, arguments);
    });
    var _HP_Shape_AddChild = (Module["_HP_Shape_AddChild"] = function () {
      return (_HP_Shape_AddChild = Module["_HP_Shape_AddChild"] =
        Module["asm"]["HP_Shape_AddChild"]).apply(null, arguments);
    });
    var _HP_Shape_RemoveChild = (Module["_HP_Shape_RemoveChild"] = function () {
      return (_HP_Shape_RemoveChild = Module["_HP_Shape_RemoveChild"] =
        Module["asm"]["HP_Shape_RemoveChild"]).apply(null, arguments);
    });
    var _HP_Shape_GetNumChildren = (Module["_HP_Shape_GetNumChildren"] =
      function () {
        return (_HP_Shape_GetNumChildren = Module["_HP_Shape_GetNumChildren"] =
          Module["asm"]["HP_Shape_GetNumChildren"]).apply(null, arguments);
      });
    var _HP_Shape_SetChildQSTransform = (Module[
      "_HP_Shape_SetChildQSTransform"
    ] = function () {
      return (_HP_Shape_SetChildQSTransform = Module[
        "_HP_Shape_SetChildQSTransform"
      ] =
        Module["asm"]["HP_Shape_SetChildQSTransform"]).apply(null, arguments);
    });
    var _HP_Shape_GetChildQSTransform = (Module[
      "_HP_Shape_GetChildQSTransform"
    ] = function () {
      return (_HP_Shape_GetChildQSTransform = Module[
        "_HP_Shape_GetChildQSTransform"
      ] =
        Module["asm"]["HP_Shape_GetChildQSTransform"]).apply(null, arguments);
    });
    var _HP_Shape_SetFilterInfo = (Module["_HP_Shape_SetFilterInfo"] =
      function () {
        return (_HP_Shape_SetFilterInfo = Module["_HP_Shape_SetFilterInfo"] =
          Module["asm"]["HP_Shape_SetFilterInfo"]).apply(null, arguments);
      });
    var _HP_Shape_GetFilterInfo = (Module["_HP_Shape_GetFilterInfo"] =
      function () {
        return (_HP_Shape_GetFilterInfo = Module["_HP_Shape_GetFilterInfo"] =
          Module["asm"]["HP_Shape_GetFilterInfo"]).apply(null, arguments);
      });
    var _HP_Shape_SetMaterial = (Module["_HP_Shape_SetMaterial"] = function () {
      return (_HP_Shape_SetMaterial = Module["_HP_Shape_SetMaterial"] =
        Module["asm"]["HP_Shape_SetMaterial"]).apply(null, arguments);
    });
    var _HP_Shape_GetMaterial = (Module["_HP_Shape_GetMaterial"] = function () {
      return (_HP_Shape_GetMaterial = Module["_HP_Shape_GetMaterial"] =
        Module["asm"]["HP_Shape_GetMaterial"]).apply(null, arguments);
    });
    var _HP_Shape_SetDensity = (Module["_HP_Shape_SetDensity"] = function () {
      return (_HP_Shape_SetDensity = Module["_HP_Shape_SetDensity"] =
        Module["asm"]["HP_Shape_SetDensity"]).apply(null, arguments);
    });
    var _HP_Shape_GetDensity = (Module["_HP_Shape_GetDensity"] = function () {
      return (_HP_Shape_GetDensity = Module["_HP_Shape_GetDensity"] =
        Module["asm"]["HP_Shape_GetDensity"]).apply(null, arguments);
    });
    var _HP_Shape_CastRay = (Module["_HP_Shape_CastRay"] = function () {
      return (_HP_Shape_CastRay = Module["_HP_Shape_CastRay"] =
        Module["asm"]["HP_Shape_CastRay"]).apply(null, arguments);
    });
    var _HP_Shape_BuildMassProperties = (Module[
      "_HP_Shape_BuildMassProperties"
    ] = function () {
      return (_HP_Shape_BuildMassProperties = Module[
        "_HP_Shape_BuildMassProperties"
      ] =
        Module["asm"]["HP_Shape_BuildMassProperties"]).apply(null, arguments);
    });
    var _HP_ShapePathIterator_GetNext = (Module[
      "_HP_ShapePathIterator_GetNext"
    ] = function () {
      return (_HP_ShapePathIterator_GetNext = Module[
        "_HP_ShapePathIterator_GetNext"
      ] =
        Module["asm"]["HP_ShapePathIterator_GetNext"]).apply(null, arguments);
    });
    var _HP_Shape_SetTrigger = (Module["_HP_Shape_SetTrigger"] = function () {
      return (_HP_Shape_SetTrigger = Module["_HP_Shape_SetTrigger"] =
        Module["asm"]["HP_Shape_SetTrigger"]).apply(null, arguments);
    });
    var _HP_Shape_CreateDebugDisplayGeometry = (Module[
      "_HP_Shape_CreateDebugDisplayGeometry"
    ] = function () {
      return (_HP_Shape_CreateDebugDisplayGeometry = Module[
        "_HP_Shape_CreateDebugDisplayGeometry"
      ] =
        Module["asm"]["HP_Shape_CreateDebugDisplayGeometry"]).apply(
        null,
        arguments,
      );
    });
    var _HP_DebugGeometry_GetInfo = (Module["_HP_DebugGeometry_GetInfo"] =
      function () {
        return (_HP_DebugGeometry_GetInfo = Module[
          "_HP_DebugGeometry_GetInfo"
        ] =
          Module["asm"]["HP_DebugGeometry_GetInfo"]).apply(null, arguments);
      });
    var _HP_DebugGeometry_Release = (Module["_HP_DebugGeometry_Release"] =
      function () {
        return (_HP_DebugGeometry_Release = Module[
          "_HP_DebugGeometry_Release"
        ] =
          Module["asm"]["HP_DebugGeometry_Release"]).apply(null, arguments);
      });
    var _HP_Body_Create = (Module["_HP_Body_Create"] = function () {
      return (_HP_Body_Create = Module["_HP_Body_Create"] =
        Module["asm"]["HP_Body_Create"]).apply(null, arguments);
    });
    var _HP_Body_Release = (Module["_HP_Body_Release"] = function () {
      return (_HP_Body_Release = Module["_HP_Body_Release"] =
        Module["asm"]["HP_Body_Release"]).apply(null, arguments);
    });
    var _HP_Body_SetShape = (Module["_HP_Body_SetShape"] = function () {
      return (_HP_Body_SetShape = Module["_HP_Body_SetShape"] =
        Module["asm"]["HP_Body_SetShape"]).apply(null, arguments);
    });
    var _HP_Body_GetShape = (Module["_HP_Body_GetShape"] = function () {
      return (_HP_Body_GetShape = Module["_HP_Body_GetShape"] =
        Module["asm"]["HP_Body_GetShape"]).apply(null, arguments);
    });
    var _HP_Body_SetMotionType = (Module["_HP_Body_SetMotionType"] =
      function () {
        return (_HP_Body_SetMotionType = Module["_HP_Body_SetMotionType"] =
          Module["asm"]["HP_Body_SetMotionType"]).apply(null, arguments);
      });
    var _HP_Body_GetMotionType = (Module["_HP_Body_GetMotionType"] =
      function () {
        return (_HP_Body_GetMotionType = Module["_HP_Body_GetMotionType"] =
          Module["asm"]["HP_Body_GetMotionType"]).apply(null, arguments);
      });
    var _HP_Body_SetEventMask = (Module["_HP_Body_SetEventMask"] = function () {
      return (_HP_Body_SetEventMask = Module["_HP_Body_SetEventMask"] =
        Module["asm"]["HP_Body_SetEventMask"]).apply(null, arguments);
    });
    var _HP_Body_GetEventMask = (Module["_HP_Body_GetEventMask"] = function () {
      return (_HP_Body_GetEventMask = Module["_HP_Body_GetEventMask"] =
        Module["asm"]["HP_Body_GetEventMask"]).apply(null, arguments);
    });
    var _HP_Body_SetMassProperties = (Module["_HP_Body_SetMassProperties"] =
      function () {
        return (_HP_Body_SetMassProperties = Module[
          "_HP_Body_SetMassProperties"
        ] =
          Module["asm"]["HP_Body_SetMassProperties"]).apply(null, arguments);
      });
    var _HP_Body_GetMassProperties = (Module["_HP_Body_GetMassProperties"] =
      function () {
        return (_HP_Body_GetMassProperties = Module[
          "_HP_Body_GetMassProperties"
        ] =
          Module["asm"]["HP_Body_GetMassProperties"]).apply(null, arguments);
      });
    var _HP_Body_SetLinearDamping = (Module["_HP_Body_SetLinearDamping"] =
      function () {
        return (_HP_Body_SetLinearDamping = Module[
          "_HP_Body_SetLinearDamping"
        ] =
          Module["asm"]["HP_Body_SetLinearDamping"]).apply(null, arguments);
      });
    var _HP_Body_GetLinearDamping = (Module["_HP_Body_GetLinearDamping"] =
      function () {
        return (_HP_Body_GetLinearDamping = Module[
          "_HP_Body_GetLinearDamping"
        ] =
          Module["asm"]["HP_Body_GetLinearDamping"]).apply(null, arguments);
      });
    var _HP_Body_SetAngularDamping = (Module["_HP_Body_SetAngularDamping"] =
      function () {
        return (_HP_Body_SetAngularDamping = Module[
          "_HP_Body_SetAngularDamping"
        ] =
          Module["asm"]["HP_Body_SetAngularDamping"]).apply(null, arguments);
      });
    var _HP_Body_GetAngularDamping = (Module["_HP_Body_GetAngularDamping"] =
      function () {
        return (_HP_Body_GetAngularDamping = Module[
          "_HP_Body_GetAngularDamping"
        ] =
          Module["asm"]["HP_Body_GetAngularDamping"]).apply(null, arguments);
      });
    var _HP_Body_SetGravityFactor = (Module["_HP_Body_SetGravityFactor"] =
      function () {
        return (_HP_Body_SetGravityFactor = Module[
          "_HP_Body_SetGravityFactor"
        ] =
          Module["asm"]["HP_Body_SetGravityFactor"]).apply(null, arguments);
      });
    var _HP_Body_GetGravityFactor = (Module["_HP_Body_GetGravityFactor"] =
      function () {
        return (_HP_Body_GetGravityFactor = Module[
          "_HP_Body_GetGravityFactor"
        ] =
          Module["asm"]["HP_Body_GetGravityFactor"]).apply(null, arguments);
      });
    var _HP_Body_GetWorld = (Module["_HP_Body_GetWorld"] = function () {
      return (_HP_Body_GetWorld = Module["_HP_Body_GetWorld"] =
        Module["asm"]["HP_Body_GetWorld"]).apply(null, arguments);
    });
    var _HP_Body_SetPosition = (Module["_HP_Body_SetPosition"] = function () {
      return (_HP_Body_SetPosition = Module["_HP_Body_SetPosition"] =
        Module["asm"]["HP_Body_SetPosition"]).apply(null, arguments);
    });
    var _HP_Body_GetPosition = (Module["_HP_Body_GetPosition"] = function () {
      return (_HP_Body_GetPosition = Module["_HP_Body_GetPosition"] =
        Module["asm"]["HP_Body_GetPosition"]).apply(null, arguments);
    });
    var _HP_Body_SetOrientation = (Module["_HP_Body_SetOrientation"] =
      function () {
        return (_HP_Body_SetOrientation = Module["_HP_Body_SetOrientation"] =
          Module["asm"]["HP_Body_SetOrientation"]).apply(null, arguments);
      });
    var _HP_Body_GetOrientation = (Module["_HP_Body_GetOrientation"] =
      function () {
        return (_HP_Body_GetOrientation = Module["_HP_Body_GetOrientation"] =
          Module["asm"]["HP_Body_GetOrientation"]).apply(null, arguments);
      });
    var _HP_Body_SetQTransform = (Module["_HP_Body_SetQTransform"] =
      function () {
        return (_HP_Body_SetQTransform = Module["_HP_Body_SetQTransform"] =
          Module["asm"]["HP_Body_SetQTransform"]).apply(null, arguments);
      });
    var _HP_Body_GetWorldTransformOffset = (Module[
      "_HP_Body_GetWorldTransformOffset"
    ] = function () {
      return (_HP_Body_GetWorldTransformOffset = Module[
        "_HP_Body_GetWorldTransformOffset"
      ] =
        Module["asm"]["HP_Body_GetWorldTransformOffset"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Body_GetQTransform = (Module["_HP_Body_GetQTransform"] =
      function () {
        return (_HP_Body_GetQTransform = Module["_HP_Body_GetQTransform"] =
          Module["asm"]["HP_Body_GetQTransform"]).apply(null, arguments);
      });
    var _HP_Body_SetLinearVelocity = (Module["_HP_Body_SetLinearVelocity"] =
      function () {
        return (_HP_Body_SetLinearVelocity = Module[
          "_HP_Body_SetLinearVelocity"
        ] =
          Module["asm"]["HP_Body_SetLinearVelocity"]).apply(null, arguments);
      });
    var _HP_Body_GetLinearVelocity = (Module["_HP_Body_GetLinearVelocity"] =
      function () {
        return (_HP_Body_GetLinearVelocity = Module[
          "_HP_Body_GetLinearVelocity"
        ] =
          Module["asm"]["HP_Body_GetLinearVelocity"]).apply(null, arguments);
      });
    var _HP_Body_SetAngularVelocity = (Module["_HP_Body_SetAngularVelocity"] =
      function () {
        return (_HP_Body_SetAngularVelocity = Module[
          "_HP_Body_SetAngularVelocity"
        ] =
          Module["asm"]["HP_Body_SetAngularVelocity"]).apply(null, arguments);
      });
    var _HP_Body_GetAngularVelocity = (Module["_HP_Body_GetAngularVelocity"] =
      function () {
        return (_HP_Body_GetAngularVelocity = Module[
          "_HP_Body_GetAngularVelocity"
        ] =
          Module["asm"]["HP_Body_GetAngularVelocity"]).apply(null, arguments);
      });
    var _HP_Body_ApplyImpulse = (Module["_HP_Body_ApplyImpulse"] = function () {
      return (_HP_Body_ApplyImpulse = Module["_HP_Body_ApplyImpulse"] =
        Module["asm"]["HP_Body_ApplyImpulse"]).apply(null, arguments);
    });
    var _HP_Body_SetTargetQTransform = (Module["_HP_Body_SetTargetQTransform"] =
      function () {
        return (_HP_Body_SetTargetQTransform = Module[
          "_HP_Body_SetTargetQTransform"
        ] =
          Module["asm"]["HP_Body_SetTargetQTransform"]).apply(null, arguments);
      });
    var _HP_Body_SetActivationState = (Module["_HP_Body_SetActivationState"] =
      function () {
        return (_HP_Body_SetActivationState = Module[
          "_HP_Body_SetActivationState"
        ] =
          Module["asm"]["HP_Body_SetActivationState"]).apply(null, arguments);
      });
    var _HP_Body_GetActivationState = (Module["_HP_Body_GetActivationState"] =
      function () {
        return (_HP_Body_GetActivationState = Module[
          "_HP_Body_GetActivationState"
        ] =
          Module["asm"]["HP_Body_GetActivationState"]).apply(null, arguments);
      });
    var _HP_Body_SetActivationControl = (Module[
      "_HP_Body_SetActivationControl"
    ] = function () {
      return (_HP_Body_SetActivationControl = Module[
        "_HP_Body_SetActivationControl"
      ] =
        Module["asm"]["HP_Body_SetActivationControl"]).apply(null, arguments);
    });
    var _HP_Body_SetActivationPriority = (Module[
      "_HP_Body_SetActivationPriority"
    ] = function () {
      return (_HP_Body_SetActivationPriority = Module[
        "_HP_Body_SetActivationPriority"
      ] =
        Module["asm"]["HP_Body_SetActivationPriority"]).apply(null, arguments);
    });
    var _HP_Constraint_Create = (Module["_HP_Constraint_Create"] = function () {
      return (_HP_Constraint_Create = Module["_HP_Constraint_Create"] =
        Module["asm"]["HP_Constraint_Create"]).apply(null, arguments);
    });
    var _HP_Constraint_Release = (Module["_HP_Constraint_Release"] =
      function () {
        return (_HP_Constraint_Release = Module["_HP_Constraint_Release"] =
          Module["asm"]["HP_Constraint_Release"]).apply(null, arguments);
      });
    var _HP_Constraint_SetParentBody = (Module["_HP_Constraint_SetParentBody"] =
      function () {
        return (_HP_Constraint_SetParentBody = Module[
          "_HP_Constraint_SetParentBody"
        ] =
          Module["asm"]["HP_Constraint_SetParentBody"]).apply(null, arguments);
      });
    var _HP_Constraint_GetParentBody = (Module["_HP_Constraint_GetParentBody"] =
      function () {
        return (_HP_Constraint_GetParentBody = Module[
          "_HP_Constraint_GetParentBody"
        ] =
          Module["asm"]["HP_Constraint_GetParentBody"]).apply(null, arguments);
      });
    var _HP_Constraint_SetChildBody = (Module["_HP_Constraint_SetChildBody"] =
      function () {
        return (_HP_Constraint_SetChildBody = Module[
          "_HP_Constraint_SetChildBody"
        ] =
          Module["asm"]["HP_Constraint_SetChildBody"]).apply(null, arguments);
      });
    var _HP_Constraint_GetChildBody = (Module["_HP_Constraint_GetChildBody"] =
      function () {
        return (_HP_Constraint_GetChildBody = Module[
          "_HP_Constraint_GetChildBody"
        ] =
          Module["asm"]["HP_Constraint_GetChildBody"]).apply(null, arguments);
      });
    var _HP_Constraint_SetAnchorInParent = (Module[
      "_HP_Constraint_SetAnchorInParent"
    ] = function () {
      return (_HP_Constraint_SetAnchorInParent = Module[
        "_HP_Constraint_SetAnchorInParent"
      ] =
        Module["asm"]["HP_Constraint_SetAnchorInParent"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_SetAnchorInChild = (Module[
      "_HP_Constraint_SetAnchorInChild"
    ] = function () {
      return (_HP_Constraint_SetAnchorInChild = Module[
        "_HP_Constraint_SetAnchorInChild"
      ] =
        Module["asm"]["HP_Constraint_SetAnchorInChild"]).apply(null, arguments);
    });
    var _HP_Constraint_SetCollisionsEnabled = (Module[
      "_HP_Constraint_SetCollisionsEnabled"
    ] = function () {
      return (_HP_Constraint_SetCollisionsEnabled = Module[
        "_HP_Constraint_SetCollisionsEnabled"
      ] =
        Module["asm"]["HP_Constraint_SetCollisionsEnabled"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_GetCollisionsEnabled = (Module[
      "_HP_Constraint_GetCollisionsEnabled"
    ] = function () {
      return (_HP_Constraint_GetCollisionsEnabled = Module[
        "_HP_Constraint_GetCollisionsEnabled"
      ] =
        Module["asm"]["HP_Constraint_GetCollisionsEnabled"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_SetEnabled = (Module["_HP_Constraint_SetEnabled"] =
      function () {
        return (_HP_Constraint_SetEnabled = Module[
          "_HP_Constraint_SetEnabled"
        ] =
          Module["asm"]["HP_Constraint_SetEnabled"]).apply(null, arguments);
      });
    var _HP_Constraint_GetEnabled = (Module["_HP_Constraint_GetEnabled"] =
      function () {
        return (_HP_Constraint_GetEnabled = Module[
          "_HP_Constraint_GetEnabled"
        ] =
          Module["asm"]["HP_Constraint_GetEnabled"]).apply(null, arguments);
      });
    var _HP_Constraint_SetAxisMinLimit = (Module[
      "_HP_Constraint_SetAxisMinLimit"
    ] = function () {
      return (_HP_Constraint_SetAxisMinLimit = Module[
        "_HP_Constraint_SetAxisMinLimit"
      ] =
        Module["asm"]["HP_Constraint_SetAxisMinLimit"]).apply(null, arguments);
    });
    var _HP_Constraint_GetAxisMinLimit = (Module[
      "_HP_Constraint_GetAxisMinLimit"
    ] = function () {
      return (_HP_Constraint_GetAxisMinLimit = Module[
        "_HP_Constraint_GetAxisMinLimit"
      ] =
        Module["asm"]["HP_Constraint_GetAxisMinLimit"]).apply(null, arguments);
    });
    var _HP_Constraint_SetAxisMaxLimit = (Module[
      "_HP_Constraint_SetAxisMaxLimit"
    ] = function () {
      return (_HP_Constraint_SetAxisMaxLimit = Module[
        "_HP_Constraint_SetAxisMaxLimit"
      ] =
        Module["asm"]["HP_Constraint_SetAxisMaxLimit"]).apply(null, arguments);
    });
    var _HP_Constraint_GetAxisMaxLimit = (Module[
      "_HP_Constraint_GetAxisMaxLimit"
    ] = function () {
      return (_HP_Constraint_GetAxisMaxLimit = Module[
        "_HP_Constraint_GetAxisMaxLimit"
      ] =
        Module["asm"]["HP_Constraint_GetAxisMaxLimit"]).apply(null, arguments);
    });
    var _HP_Constraint_GetAxisMode = (Module["_HP_Constraint_GetAxisMode"] =
      function () {
        return (_HP_Constraint_GetAxisMode = Module[
          "_HP_Constraint_GetAxisMode"
        ] =
          Module["asm"]["HP_Constraint_GetAxisMode"]).apply(null, arguments);
      });
    var _HP_Constraint_SetAxisMode = (Module["_HP_Constraint_SetAxisMode"] =
      function () {
        return (_HP_Constraint_SetAxisMode = Module[
          "_HP_Constraint_SetAxisMode"
        ] =
          Module["asm"]["HP_Constraint_SetAxisMode"]).apply(null, arguments);
      });
    var _HP_Constraint_SetAxisFriction = (Module[
      "_HP_Constraint_SetAxisFriction"
    ] = function () {
      return (_HP_Constraint_SetAxisFriction = Module[
        "_HP_Constraint_SetAxisFriction"
      ] =
        Module["asm"]["HP_Constraint_SetAxisFriction"]).apply(null, arguments);
    });
    var _HP_Constraint_GetAxisFriction = (Module[
      "_HP_Constraint_GetAxisFriction"
    ] = function () {
      return (_HP_Constraint_GetAxisFriction = Module[
        "_HP_Constraint_GetAxisFriction"
      ] =
        Module["asm"]["HP_Constraint_GetAxisFriction"]).apply(null, arguments);
    });
    var _HP_Constraint_SetAxisMotorType = (Module[
      "_HP_Constraint_SetAxisMotorType"
    ] = function () {
      return (_HP_Constraint_SetAxisMotorType = Module[
        "_HP_Constraint_SetAxisMotorType"
      ] =
        Module["asm"]["HP_Constraint_SetAxisMotorType"]).apply(null, arguments);
    });
    var _HP_Constraint_GetAxisMotorType = (Module[
      "_HP_Constraint_GetAxisMotorType"
    ] = function () {
      return (_HP_Constraint_GetAxisMotorType = Module[
        "_HP_Constraint_GetAxisMotorType"
      ] =
        Module["asm"]["HP_Constraint_GetAxisMotorType"]).apply(null, arguments);
    });
    var _HP_Constraint_SetAxisMotorTarget = (Module[
      "_HP_Constraint_SetAxisMotorTarget"
    ] = function () {
      return (_HP_Constraint_SetAxisMotorTarget = Module[
        "_HP_Constraint_SetAxisMotorTarget"
      ] =
        Module["asm"]["HP_Constraint_SetAxisMotorTarget"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_GetAxisMotorTarget = (Module[
      "_HP_Constraint_GetAxisMotorTarget"
    ] = function () {
      return (_HP_Constraint_GetAxisMotorTarget = Module[
        "_HP_Constraint_GetAxisMotorTarget"
      ] =
        Module["asm"]["HP_Constraint_GetAxisMotorTarget"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_SetAxisMotorMaxForce = (Module[
      "_HP_Constraint_SetAxisMotorMaxForce"
    ] = function () {
      return (_HP_Constraint_SetAxisMotorMaxForce = Module[
        "_HP_Constraint_SetAxisMotorMaxForce"
      ] =
        Module["asm"]["HP_Constraint_SetAxisMotorMaxForce"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_GetAxisMotorMaxForce = (Module[
      "_HP_Constraint_GetAxisMotorMaxForce"
    ] = function () {
      return (_HP_Constraint_GetAxisMotorMaxForce = Module[
        "_HP_Constraint_GetAxisMotorMaxForce"
      ] =
        Module["asm"]["HP_Constraint_GetAxisMotorMaxForce"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Constraint_SetAxisStiffness = (Module[
      "_HP_Constraint_SetAxisStiffness"
    ] = function () {
      return (_HP_Constraint_SetAxisStiffness = Module[
        "_HP_Constraint_SetAxisStiffness"
      ] =
        Module["asm"]["HP_Constraint_SetAxisStiffness"]).apply(null, arguments);
    });
    var _HP_Constraint_SetAxisDamping = (Module[
      "_HP_Constraint_SetAxisDamping"
    ] = function () {
      return (_HP_Constraint_SetAxisDamping = Module[
        "_HP_Constraint_SetAxisDamping"
      ] =
        Module["asm"]["HP_Constraint_SetAxisDamping"]).apply(null, arguments);
    });
    var _HP_World_Create = (Module["_HP_World_Create"] = function () {
      return (_HP_World_Create = Module["_HP_World_Create"] =
        Module["asm"]["HP_World_Create"]).apply(null, arguments);
    });
    var _HP_World_Release = (Module["_HP_World_Release"] = function () {
      return (_HP_World_Release = Module["_HP_World_Release"] =
        Module["asm"]["HP_World_Release"]).apply(null, arguments);
    });
    var _HP_World_GetBodyBuffer = (Module["_HP_World_GetBodyBuffer"] =
      function () {
        return (_HP_World_GetBodyBuffer = Module["_HP_World_GetBodyBuffer"] =
          Module["asm"]["HP_World_GetBodyBuffer"]).apply(null, arguments);
      });
    var _HP_World_SetGravity = (Module["_HP_World_SetGravity"] = function () {
      return (_HP_World_SetGravity = Module["_HP_World_SetGravity"] =
        Module["asm"]["HP_World_SetGravity"]).apply(null, arguments);
    });
    var _HP_World_GetGravity = (Module["_HP_World_GetGravity"] = function () {
      return (_HP_World_GetGravity = Module["_HP_World_GetGravity"] =
        Module["asm"]["HP_World_GetGravity"]).apply(null, arguments);
    });
    var _HP_World_AddBody = (Module["_HP_World_AddBody"] = function () {
      return (_HP_World_AddBody = Module["_HP_World_AddBody"] =
        Module["asm"]["HP_World_AddBody"]).apply(null, arguments);
    });
    var _HP_World_RemoveBody = (Module["_HP_World_RemoveBody"] = function () {
      return (_HP_World_RemoveBody = Module["_HP_World_RemoveBody"] =
        Module["asm"]["HP_World_RemoveBody"]).apply(null, arguments);
    });
    var _HP_World_GetNumBodies = (Module["_HP_World_GetNumBodies"] =
      function () {
        return (_HP_World_GetNumBodies = Module["_HP_World_GetNumBodies"] =
          Module["asm"]["HP_World_GetNumBodies"]).apply(null, arguments);
      });
    var _HP_World_CastRayWithCollector = (Module[
      "_HP_World_CastRayWithCollector"
    ] = function () {
      return (_HP_World_CastRayWithCollector = Module[
        "_HP_World_CastRayWithCollector"
      ] =
        Module["asm"]["HP_World_CastRayWithCollector"]).apply(null, arguments);
    });
    var _HP_World_Step = (Module["_HP_World_Step"] = function () {
      return (_HP_World_Step = Module["_HP_World_Step"] =
        Module["asm"]["HP_World_Step"]).apply(null, arguments);
    });
    var _HP_World_SetIdealStepTime = (Module["_HP_World_SetIdealStepTime"] =
      function () {
        return (_HP_World_SetIdealStepTime = Module[
          "_HP_World_SetIdealStepTime"
        ] =
          Module["asm"]["HP_World_SetIdealStepTime"]).apply(null, arguments);
      });
    var _HP_World_GetNextCollisionEvent = (Module[
      "_HP_World_GetNextCollisionEvent"
    ] = function () {
      return (_HP_World_GetNextCollisionEvent = Module[
        "_HP_World_GetNextCollisionEvent"
      ] =
        Module["asm"]["HP_World_GetNextCollisionEvent"]).apply(null, arguments);
    });
    var _HP_World_GetNextTriggerEvent = (Module[
      "_HP_World_GetNextTriggerEvent"
    ] = function () {
      return (_HP_World_GetNextTriggerEvent = Module[
        "_HP_World_GetNextTriggerEvent"
      ] =
        Module["asm"]["HP_World_GetNextTriggerEvent"]).apply(null, arguments);
    });
    var _HP_QueryCollector_Create = (Module["_HP_QueryCollector_Create"] =
      function () {
        return (_HP_QueryCollector_Create = Module[
          "_HP_QueryCollector_Create"
        ] =
          Module["asm"]["HP_QueryCollector_Create"]).apply(null, arguments);
      });
    var _HP_QueryCollector_Release = (Module["_HP_QueryCollector_Release"] =
      function () {
        return (_HP_QueryCollector_Release = Module[
          "_HP_QueryCollector_Release"
        ] =
          Module["asm"]["HP_QueryCollector_Release"]).apply(null, arguments);
      });
    var _HP_QueryCollector_GetNumHits = (Module[
      "_HP_QueryCollector_GetNumHits"
    ] = function () {
      return (_HP_QueryCollector_GetNumHits = Module[
        "_HP_QueryCollector_GetNumHits"
      ] =
        Module["asm"]["HP_QueryCollector_GetNumHits"]).apply(null, arguments);
    });
    var _HP_QueryCollector_GetCastRayResult = (Module[
      "_HP_QueryCollector_GetCastRayResult"
    ] = function () {
      return (_HP_QueryCollector_GetCastRayResult = Module[
        "_HP_QueryCollector_GetCastRayResult"
      ] =
        Module["asm"]["HP_QueryCollector_GetCastRayResult"]).apply(
        null,
        arguments,
      );
    });
    var _main = (Module["_main"] = function () {
      return (_main = Module["_main"] = Module["asm"]["main"]).apply(
        null,
        arguments,
      );
    });
    var _malloc = (Module["_malloc"] = function () {
      return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(
        null,
        arguments,
      );
    });
    var _free = (Module["_free"] = function () {
      return (_free = Module["_free"] = Module["asm"]["free"]).apply(
        null,
        arguments,
      );
    });
    var _HP_Debug_StartRecordingStats = (Module[
      "_HP_Debug_StartRecordingStats"
    ] = function () {
      return (_HP_Debug_StartRecordingStats = Module[
        "_HP_Debug_StartRecordingStats"
      ] =
        Module["asm"]["HP_Debug_StartRecordingStats"]).apply(null, arguments);
    });
    var _HP_Debug_StopRecordingStats = (Module["_HP_Debug_StopRecordingStats"] =
      function () {
        return (_HP_Debug_StopRecordingStats = Module[
          "_HP_Debug_StopRecordingStats"
        ] =
          Module["asm"]["HP_Debug_StopRecordingStats"]).apply(null, arguments);
      });
    var ___errno_location = (Module["___errno_location"] = function () {
      return (___errno_location = Module["___errno_location"] =
        Module["asm"]["__errno_location"]).apply(null, arguments);
    });
    var _htons = (Module["_htons"] = function () {
      return (_htons = Module["_htons"] = Module["asm"]["htons"]).apply(
        null,
        arguments,
      );
    });
    var _ntohs = (Module["_ntohs"] = function () {
      return (_ntohs = Module["_ntohs"] = Module["asm"]["ntohs"]).apply(
        null,
        arguments,
      );
    });
    var ___getTypeName = (Module["___getTypeName"] = function () {
      return (___getTypeName = Module["___getTypeName"] =
        Module["asm"]["__getTypeName"]).apply(null, arguments);
    });
    var __embind_initialize_bindings = (Module["__embind_initialize_bindings"] =
      function () {
        return (__embind_initialize_bindings = Module[
          "__embind_initialize_bindings"
        ] =
          Module["asm"]["_embind_initialize_bindings"]).apply(null, arguments);
      });
    var _htonl = (Module["_htonl"] = function () {
      return (_htonl = Module["_htonl"] = Module["asm"]["htonl"]).apply(
        null,
        arguments,
      );
    });
    var _setThrew = (Module["_setThrew"] = function () {
      return (_setThrew = Module["_setThrew"] =
        Module["asm"]["setThrew"]).apply(null, arguments);
    });
    var _saveSetjmp = (Module["_saveSetjmp"] = function () {
      return (_saveSetjmp = Module["_saveSetjmp"] =
        Module["asm"]["saveSetjmp"]).apply(null, arguments);
    });
    var stackSave = (Module["stackSave"] = function () {
      return (stackSave = Module["stackSave"] =
        Module["asm"]["stackSave"]).apply(null, arguments);
    });
    var stackRestore = (Module["stackRestore"] = function () {
      return (stackRestore = Module["stackRestore"] =
        Module["asm"]["stackRestore"]).apply(null, arguments);
    });
    var stackAlloc = (Module["stackAlloc"] = function () {
      return (stackAlloc = Module["stackAlloc"] =
        Module["asm"]["stackAlloc"]).apply(null, arguments);
    });
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function callMain(args) {
      var entryFunction = Module["_main"];
      var argc = 0;
      var argv = 0;
      try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
      } catch (e) {
        return handleException(e);
      }
    }
    function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module);
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (shouldRunNow) callMain(args);
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
          setTimeout(function () {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    var shouldRunNow = true;
    if (Module["noInitialRun"]) shouldRunNow = false;
    run();

    return HavokPhysics.ready;
  };
})();
export default HavokPhysics;
