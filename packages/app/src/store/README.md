# Redux store design

## Normalize
[Description for normalize](http://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html) and [Normalize library](https://github.com/paularmstrong/normalizr) (but we don't need it for now.).

## State

### Users

``` typescript
{
    signedInUser: number,
    signedInUserToken: string,
    users: {
        byId: {
            [id: number]: {
                id: number,
                email?: string,
                firstname?: string,
                lastname?: string,
                company?: string,
                position?: string
            }
        },
        allIds: Array<number>
    }
}
```

### Projects

``` typescript
{
    selectedProject: number,
    projects: {
        byId: {
            [id: number]: {
                id: number,
                title: string,
                description: string,
                symbolColor: Color,
                user: number,
                createdAt: Date,
                updatedAt: Date
            }
        },
        allIds: Array<number>
    }
}
```

### Contents

``` typescript
{
    selectedContents: Array<number>,
    contents: {
        byId: {
            [id: number]: {
                id: number,
                projectId: number,
                title: string,
                type: 'map' | 'annotation' | 'panorama',
                info: {
                    lat?: number,
                    lon?: number
                },
                takenAt?: Date,
                createdAt: Date,
                updatedAt: Date
            }
        },
        allIds: Array<number>
    }
}
```

## APIs

### Auth APIs

1. POST / sign In  
   Update `Users`.
1. POST / sign Up  
   Don't update anything.

### Projects APIs

1. GET / projects  
   Update `Projects`.
1. POST / project  
   Update `Projects`.
1. PATCH / project (?)  
   Update `Projects`.
1. DELETE / project  
   Update `Projects`.

### Contents APIs

1. GET / contents  
   Update `Contents`.
1. POST / content  
   Update `Contents`.
1. PATCH / content (?)  
   Update `Contents`.
1. DELETE / content (?)  
   Update `Contents`.
1. GET / attachments  
   Don't update anything.
1. POST / attachment  
   Don't update anything.
1. GET / tms info  
   Don't update anything.

### Share APIs

Make another store?
