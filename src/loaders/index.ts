import dependencyInjectorLoader from './dependencyInjector';

export default () => {

  const { success } = dependencyInjectorLoader();

  if(!success){
      console.log("Dependency Injector not Loaded");
  }
  
  console.log("Dependency Injector Loaded");
};