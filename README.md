## Introduction

Description of your project here.

To Populate GraphDb

1. Truncate all collection - tools/truncate_collections.js
2. Don't forget to have the environment variable NODE_ENV which indicates to the Database and collections
3. In the config folder there are several configuration files depending on the above variable
4. There is a dumpFile variable, insert into it your filename
5. Then populate parts - node  tools/populate_parts.js. Don't forget about NODE_ENV variable
6. Then populate boms and interchanges tools/populate_boms_interchanges.js 
7. Then populate alt boms
