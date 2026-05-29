import { Project, SyntaxKind, ClassDeclaration, MethodDeclaration } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: 'C:/Users/JonataoCardoso/Documents/GitHub/med-api/tsconfig.json',
});

const controllers = project.getSourceFiles('src/**/*.controller.ts');

const apiDoc: any[] = [];

for (const sourceFile of controllers) {
  const classes = sourceFile.getClasses();
  
  for (const cls of classes) {
    const controllerDecorator = cls.getDecorator('Controller');
    if (!controllerDecorator) continue;
    
    const controllerPath = controllerDecorator.getArguments()[0]?.getText().replace(/['"]/g, '') || '';
    
    const methodsData: any[] = [];
    
    for (const method of cls.getMethods()) {
      let httpMethod = '';
      let methodPath = '';
      
      const getDec = method.getDecorator('Get');
      const postDec = method.getDecorator('Post');
      const patchDec = method.getDecorator('Patch');
      const deleteDec = method.getDecorator('Delete');
      const putDec = method.getDecorator('Put');
      
      if (getDec) { httpMethod = 'GET'; methodPath = getDec.getArguments()[0]?.getText().replace(/['"]/g, '') || ''; }
      else if (postDec) { httpMethod = 'POST'; methodPath = postDec.getArguments()[0]?.getText().replace(/['"]/g, '') || ''; }
      else if (patchDec) { httpMethod = 'PATCH'; methodPath = patchDec.getArguments()[0]?.getText().replace(/['"]/g, '') || ''; }
      else if (deleteDec) { httpMethod = 'DELETE'; methodPath = deleteDec.getArguments()[0]?.getText().replace(/['"]/g, '') || ''; }
      else if (putDec) { httpMethod = 'PUT'; methodPath = putDec.getArguments()[0]?.getText().replace(/['"]/g, '') || ''; }
      else { continue; } // Not an endpoint
      
      const fullPath = `/${controllerPath}${methodPath ? '/' + methodPath : ''}`.replace(/\/\//g, '/');
      
      // Extract parameters
      const paramsData: any[] = [];
      const bodyData: any[] = [];
      const queryData: any[] = [];
      
      for (const param of method.getParameters()) {
        const isBody = param.getDecorator('Body');
        const isParam = param.getDecorator('Param');
        const isQuery = param.getDecorator('Query');
        
        const paramType = param.getTypeNode()?.getText() || 'any';
        const paramName = param.getName();
        
        if (isBody) {
          bodyData.push({ name: paramName, type: paramType });
        } else if (isParam) {
          paramsData.push({ name: paramName, type: paramType, key: isParam.getArguments()[0]?.getText().replace(/['"]/g, '') || paramName });
        } else if (isQuery) {
          queryData.push({ name: paramName, type: paramType });
        }
      }
      
      // Extract service call
      let serviceCalls: string[] = [];
      const bodyText = method.getBody()?.getText() || '';
      const regex = /this\.([a-zA-Z0-9_]+Service)\.([a-zA-Z0-9_]+)\(/g;
      let match;
      while ((match = regex.exec(bodyText)) !== null) {
        serviceCalls.push(`Service: ${match[1]}, Method: ${match[2]}`);
      }
      
      // Extract ApiBody/ApiOperation etc
      const apiBody = method.getDecorator('ApiBody')?.getArguments()[0]?.getText() || '';
      
      methodsData.push({
        name: method.getName(),
        httpMethod,
        path: fullPath,
        params: paramsData,
        query: queryData,
        body: bodyData,
        apiBody: apiBody,
        serviceCalls: [...new Set(serviceCalls)]
      });
    }
    
    apiDoc.push({
      controller: cls.getName(),
      path: `/${controllerPath}`,
      endpoints: methodsData
    });
  }
}

fs.writeFileSync('C:/Users/JonataoCardoso/.gemini/antigravity/brain/8f04e0a9-f64e-4872-9ece-6950a1298a21/scratch/api-data.json', JSON.stringify(apiDoc, null, 2));
console.log('Done parsing controllers');
