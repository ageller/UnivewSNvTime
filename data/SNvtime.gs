layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;

uniform float radiusScale;
uniform sampler2D stateTexture;

out vec2 texcoord;
out float type;

// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

void drawSprite(vec4 position, float radius, float rotation)
{
	vec3 objectSpaceUp = vec3(0, 0, 1);
	vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
	vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
	vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
	vec3 side = cross(rotatedUp, cameraDirection);
	texcoord = vec2(0, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(0, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

void main()
{
	//get the time from the texture
	float eventTime = texture(stateTexture, vec2(0.5)).r;

	float time = gl_in[1].gl_Position.x;
	float log10lum = gl_in[1].gl_Position.y;
	type = gl_in[1].gl_Position.z;

	vec4 pos = vec4(gl_in[0].gl_Position.x, gl_in[0].gl_Position.y, gl_in[0].gl_Position.z, 1.);
	
	if (time <= eventTime){
		drawSprite(pos, radiusScale*log10lum, 0);
	}
}
