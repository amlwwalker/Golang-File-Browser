package controllers

import (
	"github.com/revel/revel"
	"path/filepath"
	"strings"
	"strconv"
	"fmt"
	"os"
)

type App struct {
	*revel.Controller
}
////////////////////////////////////////////////////////////////////////


type State struct {
	Opened   	bool      	`json:"opened"`
	Selected   	bool      	`json:"selected"`
}

type Data struct {
    Data 		[]Inner 	`json:"data"`
}

type Core struct {
    Core 		Data 		`json:"core"` 	
    Plugins 	[]string 	`json:"plugins"`
}

type Inner struct {
    Id   		string 		`json:"id"`
    Parent   	string      `json:"parent"`
    Text   		string      `json:"text"`
    Summary   	string      `json:"summary"`
}


// ////////////////////////////////////////////////////////////////////////
func (c App) GetFile(filename string) revel.Result {
	
	var title string
	c.Params.Bind(&title, "title")
	title = strings.Replace(title, "_", " ", -1)

	//need to test the file actually exists first.

	fileRoot := "/Users/alex/Documents/testwikis/"
	s := []string{fileRoot, filename}
	file, err := os.Open(strings.Join(s, "")) // For read access.
	if err != nil {
		fmt.Println("error'd out")
	}
	return c.RenderFile(file, "attachment") //inline would try and display it.
}

func getFolderStructure(fileLocation string) []Inner {
	
	dataArray := make([]Inner, 0)
	currentDir := fileLocation

	filepath.Walk( fileLocation, func(path string, info os.FileInfo, err error) error {
		
		
		if info.Mode().IsDir() {
			//damned bitsync
			if strings.Contains(path, ".sync") || strings.Contains(path, "Archive") {
				return nil;
			}
			var inner1 Inner
			//dont show path directory as an explict directory
			if path != fileLocation { //i.e its a sub directory
				absFileName := strings.Replace(path, currentDir, "", -1)
				//removes .md off the file name to display
				relFileName := strings.Split(absFileName, "/")
				//fmt.Println("rel file name: ", relFileName[len(relFileName)-1]) 
				filename := strings.Replace(relFileName[len(relFileName)-1], ".md", "", -1)	
				//sorting out the parent directory:
				parent := strings.Split(path, "/")
				if parent[len(parent)-2] != "testwikis" { //if its parent is not the root
					inner1 = Inner{filename, parent[len(parent)-2], filename, "directory"}	
				} else {
					inner1 = Inner{filename, "#", filename, "directory"}	
				}
				dataArray = append(dataArray, inner1)
			}	

		} else { // This is a markdown file

			if strings.Contains(path, ".DS_Store") || strings.Contains(path, ".sync") || strings.Contains(path, "Archive") {
				return nil;
			}	
			absFileName := strings.Replace(path, currentDir, "", -1)
			//removes .md off the file name to display
			relFileName := strings.Split(absFileName, "/")
			filename := relFileName[len(relFileName)-1]

			var inner1 Inner
			parent := strings.Split(path, "/")
			if parent[len(parent)-2] != "testwikis" {
				inner1 = Inner{filename, parent[len(parent)-2], strings.Split(filename, ".")[0], strconv.FormatInt(info.Size(), 10)}
			} else {
				inner1 = Inner{filename, "#", strings.Split(filename, ".")[0] , strconv.FormatInt(info.Size(), 10)}
			}	
			dataArray = append(dataArray, inner1)
			
		}

		return nil
	
	}) // end of filepath.Walk

	return dataArray;
}


////////////////////////////////////////////////////////////////////////

func (c App) Json() revel.Result {
	return c.RenderJson(getFolderStructure("/Users/alex/Documents/testwikis"))
}

func (c App) Explorer() revel.Result {
	
	return c.Render()
}

func (c App) Index() revel.Result {
	
	return c.Render()
}
