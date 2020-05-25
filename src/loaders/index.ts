import dependencyInjectorLoader from './dependencyInjector';

export default () => {

  const { success } = dependencyInjectorLoader();

  if(!success){
      // TODO: Log Dependency Injector not loaded.
      console.log("Dependency Injector not Loaded");
  }
  
  // TODO: Log Dependency Injector Loaded.
  console.log("Dependency Injector Loaded");

};