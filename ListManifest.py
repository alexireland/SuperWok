#!/usr/bin/env python

import os
import hashlib


warningFiles = []


def printFiles(listing, path, fileList):
   
    for infile in listing:
        if (os.path.isfile(path + infile)):         #CHECK IF FILE
            if not auxiliaryFile(infile):           #Stop Adding unnecessary Files
                fileList.append(path + infile)
                if ((' ') in infile) == True:
                    warningFiles.append(path + infile)
        else:
            if (infile != "CVS"):
                printFiles(os.listdir(path + infile), path+infile+ "/", fileList)

    return fileList

def getBytes(filename):
    
    file = open(filename, "rb")
    
    bytes = file.read(128)
    fullbytes = b""
    while bytes != b"":
        bytes = file.read(128)
        fullbytes += bytes
        
    file.close()
    return fullbytes

def getHash(fileList):
    
    hash = hashlib.md5()
    sytes = b""
    for file in fileList:
        
        sytes += getBytes(file)
        hash.update(sytes)
    
    return hash.digest()



def createManifest(fileList):
    
    #hash = getHash(fileList)
    f = open('./main.manifest', 'w')

    f.write("CACHE MANIFEST\n")
    f.write("\n")
    f.write("CACHE:\n")
    
    for fn in fileList:
        
        cleanFileName = fn.lstrip("./web/")
        f.write("./" + cleanFileName + "\n")
        print (cleanFileName)
        
    f.write("\nHASH:\n")
    f.write("*\n")
    #f.write(hash)
    f.write("\n\nNETWORK:\n")
    f.write("*\n")
    f.close()



def setManifest():
    print("setting Manifest")
    path = './web/'
    listing = os.listdir(path)
    
    fileList = printFiles(listing, path, [])
    
    #print (fileList)
    
    createManifest(fileList)


#*************************************************************************************************
#                                           File Checking
#*************************************************************************************************

# Check for cvs version files that start wit '.#', e.g (.#FlightmanDatabaseMethods.js.1.3)
def cvsVersionFile(infile):
    if infile[0] + infile[1] == ".#":
        return True
    return False

def manifestFile(infile):
    if (os.path.splitext(infile)[1]) == ".manifest":
        return True
    return False

def pythonFile(infile):
    if (os.path.splitext(infile)[1]) == ".py":
        return True
    return False

def auxiliaryFile(infile):
    if cvsVersionFile(infile) or  manifestFile(infile) or pythonFile(infile):
        return True
    return False




def showWarningFiles():
    if (len(warningFiles) >0):
        print("\n \n\n \n\t\t\tWARNING!!!")
        print("\n\nThe following file(s) have been added to the manifest but will likely cause a caching error because of the spaces in the address.\n\n")

        for val in warningFiles:
            print(val)

        a = input("\n\nPress Enter To exit")



#**************************************************************************************
#                           MAIN
#**************************************************************************************


path = './'
listing = os.listdir(path)

fileList = printFiles(listing, path, [])

#print (fileList)

createManifest(fileList)
showWarningFiles()

