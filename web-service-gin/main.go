package main

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

type album struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Artist string `json:"artist"`
	Price float64 `json:"price"`
}

var albums = []album{
    {Id: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
    {Id: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
    {Id: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func main() {
    router := gin.Default()

	router.GET("/health", health)

    router.GET("/albums", getAlbums)
	router.GET("/albums/:id", getAlbumByID)
	router.POST("/albums", postAlbums)

    router.Run("localhost:8080")
}

func getAlbums(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, albums)
}

func postAlbums(c *gin.Context) {
    var newAlbum album

    if err := c.BindJSON(&newAlbum); err != nil {
        return
    }

    albums = append(albums, newAlbum)
    c.IndentedJSON(http.StatusCreated, newAlbum)
}

func getAlbumByID(c *gin.Context) {
    id := c.Param("id")

    index := slices.IndexFunc(albums, func(a album) bool {
		return a.Id == id
	})
	if index == -1 {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
		return
	}
	c.IndentedJSON(http.StatusOK, albums[index])
}

func health(c *gin.Context) {
	c.IndentedJSON(http.StatusOK,  gin.H{"status": "OK"})
}