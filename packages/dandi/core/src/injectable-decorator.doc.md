# Injectable
Marks a class as available to the application's [[Injector]] for creation.

# Injectable:token
An [[InjectionToken]] to use to register the decorated class in addition to the class itself

# Injectable:options
One or more [[InjectableOption]] tokens used to control how the class is registered for dependency injection

# InjectableOption:values
Valid [[InjectableOption]] values are [[Singleton]], [[NotSingleton]], [[Multi]], [[NotMulti]], and [[NoSelf]]
