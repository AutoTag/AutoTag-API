import { NextFunction, Request, Response, Router } from 'express';
import { getRepository } from '../model/repository';
import { Project } from '../model/project';
import { User } from '../model/user';
import { Tag } from '../model/tag';
import Container from 'typedi';
import ProjectFileManagerService from '../services/ProjectFileManager';
import { ProjectType, DataFormat } from '../services/ProjectFileManager';

export const projectRouter: Router = Router();

projectRouter.get('/project', async function (req: Request, res: Response, next: NextFunction) {
  console.log((req as any).user.name + ': Get All Projects');

  try {
    const repository = await getRepository(Project);
    const allProjects = await repository.find({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
      },
      order: {
          lastUpdate: "DESC",
      },
    });
    console.log(allProjects);

    return res.status(200).send(allProjects);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid', async function (req: Request, res: Response, next: NextFunction) {
  console.log(`${(req as any).user.name} ': Get Project 'uuid=${req.params.uuid}'.`);

  try {
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    if(!project){
      res.statusMessage = `Project with 'uuid=${req.params.uuid}' Not Found.`;
      return res.status(404).end();
    }

    console.log(project);

    return res.status(200).send(project);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project', async function (req: Request, res: Response, next: NextFunction) {
  console.log(`${(req as any).user.name} ': Create New Project.`);
  console.log(req.body);

  if(req.body.tags == undefined || req.body.type == undefined || req.body.projectDataFormat == undefined || req.body.name == undefined || req.body.description == undefined){
    res.statusMessage = 'Missing fields in request body. Required Fields: [name, description, type, projectDataFormat, tags]';
    return res.status(400).end();
  }

  const projectFileManagerInstance = Container.get(ProjectFileManagerService);

  try {
    // Initialize Tags
    const projectTags : Tag[] = [];
    const tags_repository = await getRepository(Tag);
    for (const tag in req.body.tags) {
      const newTag = new Tag();
      newTag.tag = req.body.tags[tag];
      await tags_repository.save(newTag);
      projectTags.push(newTag);
    }

    const repository = await getRepository(Project);
    const owner = new User();
    owner.id = (req as any).user.id;
    const projectType : ProjectType = req.body.type;
    const projectDataFormat : DataFormat = req.body.projectDataFormat;

    // Initialize Project
    const project = projectFileManagerInstance.InitializeProject(req.body.name, owner, req.body.description, projectType, projectDataFormat, projectTags);
    await repository.save(project);

    // Add Files to Project
    const project_addedFiles = await projectFileManagerInstance.SetProjectFiles(project, req.body.files);
    const result = await repository.save(project_addedFiles);
    
    console.log((req as any).user.name + ': Create project ' + project.uuid);
    console.log(result);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project/:uuid', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    project.name = req.body.name;
    project.description = req.body.description;

    const result = await repository.save(project);
    console.log((req as any).user.name + ': Update project ' + req.params.id);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.delete('/project/:uuid', async function (req: Request, res: Response, next: NextFunction) {
  console.log(`${(req as any).user.name} ': Delete Project`);

  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    if(!project){
      return res.status(404).send({
        message : `Project with 'uuid=${req.params.uuid}' Not Found.`
      });
    }

    // Delete Tags
    const tags_repository = await getRepository(Tag);
    project.tags.forEach(async tag => {
      await tags_repository.delete(tag.uuid);
    });

    await projectFileManagerInstance.DeleteProjectFiles(project);
    await repository.delete(project.uuid);

    return res.status(200).send(null);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid/dataBatch', async function (req: Request, res: Response, next: NextFunction) {
  console.log(`${(req as any).user.name} ': Get Project Data Batch - Project 'uuid=${req.params.uuid}'.`);
  console.log(req.body);

  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    const offset = req.query.offset;
    const limit = req.query.limit;

    const dataBatch = await projectFileManagerInstance.GetDataBatch(project, offset, limit);

    res.send(dataBatch);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project/:uuid/dataTag', async function (req: Request, res: Response, next: NextFunction) {
  console.log(`${(req as any).user.name} ': Update DataTag - Project 'uuid=${req.params.uuid}'.`);
  console.log(req.body);

  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    const rowId : number = req.body.rowId;
    const tag : string = req.body.tag;

    const updatedProject = await projectFileManagerInstance.UpdateTag(project, rowId, tag);
    await repository.save(updatedProject);

    // Get Updated Project with Populated Fields
    const result = await repository.findOne({ 
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    return res.status(201).send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project/:uuid/generate', async function (req: Request, res: Response, next: NextFunction) {
  console.log((req as any).user.name + ': Generate project pre tags ' + req.params.uuid);

  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    const result = await projectFileManagerInstance.GenerateProjectPreTags(project);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid/export', async function (req: Request, res: Response, next: NextFunction) {
  console.log((req as any).user.name + ': Export project ' + req.params.uuid);

  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({
      relations: ["owner", "tags"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    const exportTagsFile = await projectFileManagerInstance.ExportProject(project);

    return res.status(200).send({
      tagsContent : exportTagsFile
    });
  }
  catch (err) {
    return next(err);
  };
});

projectRouter.get('/project/:uuid/download', async function (req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Implement request
    console.log((req as any).user.email + ': Download project ' + req.params.uuid);
    res.send(null);
  }
  catch (err) {
    return next(err);
  }
});