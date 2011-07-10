//shaders.js
//Default Shaders

(function() {
  //Add default shaders
  var Shaders = {
    Vertex: {},
    Fragment: {}
  };

  var VertexShaders = Shaders.Vertex,
      FragmentShaders = Shaders.Fragment;

  VertexShaders.Default = [
    "#define LIGHT_MAX 40",
    //object attributes
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec4 color;",
    "attribute vec4 pickingColor;",
    "attribute vec2 texCoord1;",
    //camera and object matrices
    "uniform mat4 viewMatrix;",
    "uniform mat4 viewInverseMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewProjectionMatrix;",
    //objectMatrix * viewMatrix = worldMatrix
    "uniform mat4 worldMatrix;",
    "uniform mat4 worldInverseMatrix;",
    "uniform mat4 worldInverseTransposeMatrix;",
    "uniform mat4 objectMatrix;",
    "uniform vec3 cameraPosition;",
    //lighting configuration
    "uniform bool enableLights;",
    "uniform vec3 ambientColor;",
    "uniform vec3 directionalColor;",
    "uniform vec3 lightingDirection;",
    //point lights configuration
    "uniform vec3 pointLocation[LIGHT_MAX];",
    "uniform vec3 pointColor[LIGHT_MAX];",
    "uniform int numberPoints;",
    //reflection / refraction configuration
		"uniform float refraction;",
		"uniform bool useReflection;",
    //varyings
		"varying vec3 vReflection;",
    "varying vec4 vColor;",
    "varying vec4 vPickingColor;",
    "varying vec2 vTexCoord;",
    "varying vec3 lightWeighting;",

    "void main(void) {",
      "vec4 mvPosition = viewMatrix * vec4(position, 1.0);",
      "vec4 transformedNormal = worldInverseTransposeMatrix* vec4(normal, 1.0);",
      //lighting code 
      "if(!enableLights) {",
        "lightWeighting = vec3(1.0, 1.0, 1.0);",
      "} else {",
        "vec3 plightDirection;",
        "vec3 pointWeight = vec3(0.0, 0.0, 0.0);",
        "float directionalLightWeighting = max(dot(transformedNormal.xyz, lightingDirection), 0.0);",
        "for (int i = 0; i < LIGHT_MAX; i++) {",
          "if (i < numberPoints) {",
            "plightDirection = normalize((worldMatrix * vec4(pointLocation[i], 1.0)).xyz - mvPosition.xyz);",
            "pointWeight += max(dot(transformedNormal.xyz, plightDirection), 0.0) * pointColor[i];",
          "} else {",
            "break;",
          "}",
        "}",

        "lightWeighting = ambientColor + (directionalColor * directionalLightWeighting) + pointWeight;",
      "}",
      //refraction / reflection code
      "if (useReflection) {",
        "if (refraction > 0.0) {",
          "vReflection = refract(normalize(mvPosition.xyz - cameraPosition), transformedNormal.xyz, refraction);",
        "} else {",
          "vReflection = reflect(normalize(mvPosition.xyz - cameraPosition), transformedNormal.xyz);",
          //"vReflection = reflect(normalize(mvPosition.xyz - cameraPosition), normalize((viewMatrix * vec4(normal, 1.0)).xyz));",
        "}",
      "} else {",
        "vReflection = normalize(vec3(1.0, 1.0, 1.0));",
      "}",
      //pass results to varyings
      "vColor = color;",
      "vPickingColor = pickingColor;",
      "vTexCoord = texCoord1;",
      "gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);",
    "}"
  
  ].join("\n");


 FragmentShaders.Default = [

    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",
    //varyings
    "varying vec4 vColor;",
    "varying vec4 vPickingColor;",
    "varying vec2 vTexCoord;",
    "varying vec3 lightWeighting;",
    "varying vec3 vReflection;",
    //texture configs
    "uniform bool hasTexture1;",
    "uniform sampler2D sampler1;",
    "uniform bool hasTextureCube1;",
		"uniform samplerCube samplerCube1;",
    //picking configs
    "uniform bool enablePicking;",
    "uniform bool hasPickingColors;",
    "uniform vec3 pickColor;",
		//reflection / refraction configs
		"uniform float reflection;",
		"uniform int combine;",
    //fog configuration
    "uniform bool hasFog;",
    "uniform vec3 fogColor;",
    "uniform float fogNear;",
    "uniform float fogFar;",

    "void main(){",
      //set color from texture
      "if (!hasTexture1) {",
        "gl_FragColor = vec4(vColor.rgb * lightWeighting, vColor.a);",
      "} else {",
        "gl_FragColor = vec4(texture2D(sampler1, vec2(vTexCoord.s, vTexCoord.t)).rgb * lightWeighting, 1.0);",
      "}",
      //has cube texture then apply reflection
     "if (hasTextureCube1) {",
       "vec4 cubeColor = textureCube(samplerCube1, normalize(vec3(-vReflection.x, vReflection.yz)));",
        "if (true || combine == 1) {",
          "gl_FragColor = vec4(mix(gl_FragColor.xyz, cubeColor.xyz, reflection), 1.0);",
        "} else {",
          "gl_FragColor = gl_FragColor * cubeColor;",
        "}",
     "}",
      //set picking
      "if (enablePicking) {",
        "if (hasPickingColors) {",
          "gl_FragColor = vPickingColor;",
        "} else {",
          "gl_FragColor = vec4(pickColor, 1.0);",
        "}",
      "}",
      //handle fog
      "if (hasFog) {",
        "float depth = gl_FragCoord.z / gl_FragCoord.w;",
        "float fogFactor = smoothstep(fogNear, fogFar, depth);",
        "gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);",
      "}",
    "}"

  ].join("\n");

/*
  VertexShaders.Default = [
    "#define LIGHT_MAX 40",
    
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec4 color;",
    "attribute vec4 pickingColor;",
    "attribute vec2 texCoord1;",
    
    "uniform mat4 viewMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 worldInverseTranspose;",

    "uniform bool enableLights;",
    "uniform vec3 ambientColor;",
    "uniform vec3 directionalColor;",
    "uniform vec3 lightingDirection;",

    "uniform vec3 pointLocation[LIGHT_MAX];",
    "uniform vec3 pointColor[LIGHT_MAX];",
    "uniform int numberPoints;",
   
    "varying vec4 vColor;",
    "varying vec4 vPickingColor;",
    "varying vec2 vTexCoord;",
    "varying vec3 lightWeighting;",
    
    "void main(void) {",
      "vec4 mvPosition = viewMatrix * vec4(position, 1.0);",
      
      "if(!enableLights) {",
        "lightWeighting = vec3(1.0, 1.0, 1.0);",
      "} else {",
        "vec3 plightDirection;",
        "vec3 pointWeight = vec3(0.0, 0.0, 0.0);",
        "vec4 transformedNormal = worldInverseTransposeMatrix* vec4(normal, 1.0);",
        "float directionalLightWeighting = max(dot(transformedNormal.xyz, lightingDirection), 0.0);",
        "for (int i = 0; i < LIGHT_MAX; i++) {",
          "if (i < numberPoints) {",
            "plightDirection = normalize((viewMatrix * vec4(pointLocation[i], 1.0)).xyz - mvPosition.xyz);",
            "pointWeight += max(dot(transformedNormal.xyz, plightDirection), 0.0) * pointColor[i];",
          "} else {",
            "break;",
          "}",
        "}",

        "lightWeighting = ambientColor + (directionalColor * directionalLightWeighting) + pointWeight;",
      "}",
      
      "vColor = color;",
      "vPickingColor = pickingColor;",
      "vTexCoord = texCoord1;",
      "gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);",
    "}"
  
  ].join("\n");


 FragmentShaders.Default = [

    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",
    
    "varying vec4 vColor;",
    "varying vec4 vPickingColor;",
    "varying vec2 vTexCoord;",
    "varying vec3 lightWeighting;",
    
    "uniform bool hasTexture1;",
    "uniform sampler2D sampler1;",

    "uniform bool enablePicking;",
    "uniform bool hasPickingColors;",
    "uniform vec3 pickColor;",

    "uniform bool hasFog;",
    "uniform vec3 fogColor;",

    "uniform float fogNear;",
    "uniform float fogFar;",

    "void main(){",
      
      "if(!hasTexture1) {",
        "gl_FragColor = vec4(vColor.rgb * lightWeighting, vColor.a);",
      "} else {",
        "gl_FragColor = vec4(texture2D(sampler1, vec2(vTexCoord.s, vTexCoord.t)).rgb * lightWeighting, 1.0);",
      "}",

      "if(enablePicking) {",
        "if(hasPickingColors) {",
          "gl_FragColor = vPickingColor;",
        "} else {",
          "gl_FragColor = vec4(pickColor, 1.0);",
        "}",
      "}",
      
      // handle fog
      "if (hasFog) {",
        "float depth = gl_FragCoord.z / gl_FragCoord.w;",
        "float fogFactor = smoothstep(fogNear, fogFar, depth);",
        "gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);",
      "}",  
    
    "}"

  ].join("\n");
*/
  Octant.Shaders = Shaders;
  
})();
