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
    console.log((req as any).user.name + ': Get all projects');
    console.log(allProjects);
    res.send(allProjects);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    console.log((req as any).user.email + ': Get project ' + req.params.uuid);
    res.send(project);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project', async function (req: Request, res: Response, next: NextFunction) {
  const projectFileManagerInstance = Container.get(ProjectFileManagerService);

  console.log(req.body);
  try {
    // Initialize Tags
    const tags : Tag[] = [];
    const tags_repository = await getRepository(Tag);
    for (const tag in req.body.tags) {
      const newTag = new Tag();
      newTag.tag = req.body.tags[tag];
      await tags_repository.save(newTag);
      tags.push(newTag);
    }

    const repository = await getRepository(Project);
    const owner = new User();
    owner.id = (req as any).user.id;
    const projectType : ProjectType = req.body.type;
    const projectDataFormat : DataFormat = req.body.projectDataFormat;

    // Initialize Project
    const project = projectFileManagerInstance.InitializeProject(req.body.name, owner, req.body.description, projectType, projectDataFormat, tags);
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
      relations: ["owner"],
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

    // Delete Tags
    const tags_repository = await getRepository(Tag);
    project.tags.forEach(async tag => {
      await tags_repository.delete(tag.uuid);
    });

    await projectFileManagerInstance.DeleteProjectFiles(project);
    await repository.delete(project.uuid);
    console.log((req as any).user.name + ': Delete project ' + req.params.uuid);
    res.send(null);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid/dataBatch', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    const offset = req.query.offset;
    const limit = req.query.limit;

    const dataBatch = await projectFileManagerInstance.GetDataBatch(project, offset, limit);

    console.log((req as any).user.email + ': Get project data batch ' + req.params.uuid);
    res.send(dataBatch);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project/:uuid/dataTag', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({ 
      relations: ["owner"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });
    const rowId = req.body.row;
    const tag = req.body.tag;

    const result = await projectFileManagerInstance.UpdateTag(project, rowId, tag);

    console.log((req as any).user.name + ': Update project data tag ' + req.params.id);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.post('/project/:uuid/generate', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const projectFileManagerInstance = Container.get(ProjectFileManagerService);
    const repository = await getRepository(Project);
    const project = await repository.findOne({
      relations: ["owner"],
      where: {
          owner: { id: (req as any).user.id }, 
          uuid: req.params.uuid,
      },
    });

    const result = await projectFileManagerInstance.GenerateProjectPreTags(project);

    console.log((req as any).user.name + ': Generate project pre tags ' + req.params.id);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

projectRouter.get('/project/:uuid/export', async function (req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Implement request
    console.log((req as any).user.email + ': Export project ' + req.params.uuid);
    res.send(null);
  }
  catch (err) {
    return next(err);
  }
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