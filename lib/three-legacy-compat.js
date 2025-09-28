(function () {
  if (typeof THREE === 'undefined') {
    console.warn('three-legacy-compat.js: THREE not found.');
    return;
  }

  if (!THREE.CubeGeometry && THREE.BoxGeometry) {
    THREE.CubeGeometry = THREE.BoxGeometry;
  }

  if (!THREE.ParticleSystem && THREE.Points) {
    THREE.ParticleSystem = THREE.Points;
  }

  if (!THREE.ParticleBasicMaterial && THREE.PointsMaterial) {
    THREE.ParticleBasicMaterial = THREE.PointsMaterial;
  }

  if (!THREE.ImageUtils) {
    THREE.ImageUtils = {};
  }

  THREE.ImageUtils.loadTexture = function (url, mapping, onLoad, onError) {
    var loader = new THREE.TextureLoader();
    var texture = loader.load(
      url,
      function (tex) {
        if (mapping) {
          tex.mapping = mapping;
        }
        if (typeof onLoad === 'function') {
          onLoad(tex);
        }
      },
      undefined,
      onError
    );
    if (mapping) {
      texture.mapping = mapping;
    }
    return texture;
  };

  THREE.ImageUtils.loadTextureCube = function (urls, mapping, onLoad, onError) {
    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load(
      urls,
      function (tex) {
        if (mapping) {
          tex.mapping = mapping;
        }
        if (typeof onLoad === 'function') {
          onLoad(tex);
        }
      },
      undefined,
      onError
    );
    if (mapping) {
      texture.mapping = mapping;
    }
    return texture;
  };

  if (!THREE.Projector) {
    THREE.Projector = function () {};

    THREE.Projector.prototype.unprojectVector = function (vector, camera) {
      return vector.unproject(camera);
    };

    THREE.Projector.prototype.pickingRay = function (vector, camera) {
      var raycaster = new THREE.Raycaster();
      var ndc = new THREE.Vector2(vector.x, vector.y);
      raycaster.setFromCamera(ndc, camera);
      return raycaster;
    };
  }

  if (THREE.WebGLRenderer && !THREE.WebGLRenderer.prototype.setClearColorHex) {
    THREE.WebGLRenderer.prototype.setClearColorHex = function (hex, alpha) {
      this.setClearColor(hex, alpha);
    };
  }

  if (THREE.Geometry && !THREE.Geometry.prototype.computeCentroids) {
    THREE.Geometry.prototype.computeCentroids = function () {
      // computeCentroids was removed in r72; keep as no-op for legacy lessons.
    };
  }

  if (typeof THREE.Face4 === 'undefined') {
    THREE.Face4 = function (a, b, c, d, normal, color, materialIndex) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.normal = normal && typeof normal.clone === 'function' ? normal.clone() : new THREE.Vector3();
      this.color = color && typeof color.clone === 'function' ? color.clone() : new THREE.Color();
      this.vertexNormals = [];
      this.vertexColors = [];
      this.materialIndex = materialIndex !== undefined ? materialIndex : 0;
    };
  }

  function cloneMaybe(value) {
    return value && typeof value.clone === 'function' ? value.clone() : value;
  }

  function convertLegacyQuads(geometry) {
    if (!geometry || geometry.__legacyQuadConverted || !geometry.faces) {
      return;
    }

    var faces = geometry.faces;
    var hasQuad = false;
    for (var i = 0; i < faces.length; i++) {
      if (faces[i] && faces[i].d !== undefined) {
        hasQuad = true;
        break;
      }
    }

    if (!hasQuad) {
      geometry.__legacyQuadConverted = true;
      return;
    }

    var originalUvs = geometry.faceVertexUvs.map(function (layer) {
      return layer ? layer.slice() : null;
    });

    var newFaces = [];
    var newUvs = geometry.faceVertexUvs.map(function (layer) {
      return layer ? [] : null;
    });

    for (var faceIndex = 0; faceIndex < faces.length; faceIndex++) {
      var face = faces[faceIndex];

      if (face && face.d !== undefined) {
        var a = face.a;
        var b = face.b;
        var c = face.c;
        var d = face.d;

        var f1 = new THREE.Face3(a, b, d, cloneMaybe(face.normal), cloneMaybe(face.color), face.materialIndex);
        var f2 = new THREE.Face3(b, c, d, cloneMaybe(face.normal), cloneMaybe(face.color), face.materialIndex);

        if (face.vertexNormals && face.vertexNormals.length === 4) {
          f1.vertexNormals = [
            cloneMaybe(face.vertexNormals[0]),
            cloneMaybe(face.vertexNormals[1]),
            cloneMaybe(face.vertexNormals[3])
          ];
          f2.vertexNormals = [
            cloneMaybe(face.vertexNormals[1]),
            cloneMaybe(face.vertexNormals[2]),
            cloneMaybe(face.vertexNormals[3])
          ];
        }

        if (face.vertexColors && face.vertexColors.length === 4) {
          f1.vertexColors = [
            cloneMaybe(face.vertexColors[0]),
            cloneMaybe(face.vertexColors[1]),
            cloneMaybe(face.vertexColors[3])
          ];
          f2.vertexColors = [
            cloneMaybe(face.vertexColors[1]),
            cloneMaybe(face.vertexColors[2]),
            cloneMaybe(face.vertexColors[3])
          ];
        }

        newFaces.push(f1, f2);

        for (var layerIndex = 0; layerIndex < newUvs.length; layerIndex++) {
          var targetLayer = newUvs[layerIndex];
          if (!targetLayer) {
            continue;
          }
          var originalLayer = originalUvs[layerIndex];
          var uvSet = originalLayer && originalLayer[faceIndex];

          if (uvSet && uvSet.length === 4) {
            targetLayer.push(
              [cloneMaybe(uvSet[0]), cloneMaybe(uvSet[1]), cloneMaybe(uvSet[3])],
              [cloneMaybe(uvSet[1]), cloneMaybe(uvSet[2]), cloneMaybe(uvSet[3])]
            );
          } else if (uvSet && uvSet.length === 3) {
            targetLayer.push([
              cloneMaybe(uvSet[0]),
              cloneMaybe(uvSet[1]),
              cloneMaybe(uvSet[2])
            ]);
          } else {
            targetLayer.push(undefined, undefined);
          }
        }
      } else {
        newFaces.push(face);
        for (var layerIndex2 = 0; layerIndex2 < newUvs.length; layerIndex2++) {
          var targetLayer2 = newUvs[layerIndex2];
          if (!targetLayer2) {
            continue;
          }
          var sourceLayer = originalUvs[layerIndex2];
          var faceUv = sourceLayer && sourceLayer[faceIndex];
          if (faceUv) {
            targetLayer2.push(faceUv.map(cloneMaybe));
          } else {
            targetLayer2.push(faceUv);
          }
        }
      }
    }

    geometry.faces = newFaces;
    for (var l = 0; l < newUvs.length; l++) {
      if (newUvs[l]) {
        geometry.faceVertexUvs[l] = newUvs[l];
      }
    }

    geometry.__legacyQuadConverted = true;
    geometry.elementsNeedUpdate = true;
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
  }

  if (THREE.Geometry) {
    var methods = [
      'computeFaceNormals',
      'computeVertexNormals',
      'computeFlatVertexNormals',
      'mergeVertices',
      'computeMorphNormals'
    ];

    methods.forEach(function (method) {
      if (typeof THREE.Geometry.prototype[method] === 'function') {
        var original = THREE.Geometry.prototype[method];
        THREE.Geometry.prototype[method] = function () {
          convertLegacyQuads(this);
          return original.apply(this, arguments);
        };
      }
    });
  }

  if (THREE.Mesh) {
    var OriginalMesh = THREE.Mesh;
    THREE.Mesh = function (geometry, material) {
      if (geometry && geometry.isGeometry) {
        convertLegacyQuads(geometry);
      }
      return OriginalMesh.call(this, geometry, material);
    };
    THREE.Mesh.prototype = OriginalMesh.prototype;
    THREE.Mesh.prototype.constructor = THREE.Mesh;
    for (var key in OriginalMesh) {
      if (Object.prototype.hasOwnProperty.call(OriginalMesh, key)) {
        THREE.Mesh[key] = OriginalMesh[key];
      }
    }
  }
})();
