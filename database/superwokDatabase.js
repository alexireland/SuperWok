SuperWokDatabase.isReady = sessionStorage.SuperWokDatabaseReady ? true:false;
sessionStorage.SuperWokDatabaseReady = SuperWokDatabase.isReady;
SuperWokDatabase.init = function (callback) {
    this.CreateDatabase("SuperWokDB", "SuperWok_Database", 1024 * 15, function(result) {
        callback(result);
    });

    persistence.debug = true;

}


SuperWokDatabase.CreateDatabase = function (strDbName, strDbDesc, size, callback) {
    persistence.store.websql.config(persistence, strDbName, strDbDesc, size);
    if(!SuperWokDatabase.isReady) {
        persistence.schemaSync(function(err, tx) {
            if(err) {
                console.error("ERROR :: schema sync");
                SuperWokDatabase.isReady = false;
                sessionStorage.SuperWokDatabaseReady = SuperWokDatabase.isReady;
                callback(null);
            } else if(!err && tx) {
                SuperWokDatabase.isReady = true;
                sessionStorage.SuperWokDatabaseReady = SuperWokDatabase.isReady;
                callback(null, SuperWokDatabase.isReady);
            }
        });
    } else {
        console.log("DATABASE schema was already synced!!");
        sessionStorage.SuperWokDatabaseReady = SuperWokDatabase.isReady;
        callback(null, SuperWokDatabase.isReady);
    }

}
SuperWokDatabase.loadDatabaseData = function (callback) {

    SuperWokDatabase.ITEM.all().count(function (err, counter) {
        alert(counter);
                    if(counter>0){
                        console.log("There is pre-sample data");
                        callback(false);

                    }else{

                        callback(true);
                    }

    });

};



