

Windows:

    Docker must be installed and in path. ( see https://docs.docker.com/docker-for-windows/install/ )

    (Untested as I dont have a windows machine)

    Run these commands:
        build.cmd
        run.cmd
    then open http://127.0.0.1:3000/
    
Linux:
    Dev Mode:
        npm start       ## does dev build
        CENCONFIG=./constants.dev npm run watch

    Production:
        npm run build
        pm2 restart cenweb

        PORT=33000 npx pm2 start  server.js --name "censerver"


    Other Notes: 

        "prepublish": "npm run build",
        "prepush": "npm run lint && npm run test:coverage",
        "start": "npx webpack -w --mode development",
        "report-coverage": "nyc report --reporter=lcov > coverage.lcov && codecov",
        "test": "mocha tests/helpers/setup.js tests/**/*.spec.js --require babel-register",
        "test:watch": "npm test -- --watch",
        "test:coverage": "nyc npm test",
        "dev": "npx webpack --mode development",
        "build": "npx webpack --mode production",
        "watch": "npx nodemon  server.js"



