# asclasit
ASync CLasses + ASync ITerators

# Description
This is public-ready spin off from related internal experiments of [ClAsync](https://github.com/tarquas/clasync).
Advantages of this module:
- 100% test coverage;
- More project files, less file sizes;
- Thin: has no external dependency modules, only core essentials taken from `ClAsync` and improved;
- Utilizes up-to-date Node.js features;
- Targetting serverless/stateless environments;
- Despite the missing documentation, test cases describe the usage.

## Differences
There are architectural differences listed below:

### Async Classes
| Item        |  `ClAsync` |  `AsClAsIt` |
|-------------|------------|-------------|
| Instance co-op | Dependency tree | State isolation |
| Life cycle  | Once (`init`->`final`) | Muplitle (...->`wake`->`sleep`->...) |
| Lifetime Methods | `init()`, `final()` | (Async) Generator `*[$]()` depicting whole lifetime |
| Instance state | Non-configurable `[$.inst]` | Configurable `[$]` via `static [$]`: options object or custom `$.Inst` subclass |
| Async Events      | Special class (`emitter.js`) | Automatic for each instance; methods of instance state `[$]` |
| Instance Shutdown | Supported (via `final`) | Not supported (global shutdown handler only for non-stateless environments) |

### (Async) Iterators
| Item        |  `ClAsync` |  `AsClAsIt` |
|-------------|------------|-------------|
| Helpers     | Functions: `$.<name>[Iter\|Async](it, ...)` | Wrapped chain: `$[.Iter\|.AsIt\|](it).<name>(...).<name>(...)` |
| Extensible Classes | Not supported | Supported for sync (`$.Iter`) and async (`$.AsIt`) iterator classes |

## Testing
Tests and coverage powered by [Jest](https://jestjs.io/)

# Thanks
[Time Doctor](https://timedoctor.com/)
