package main

import (
	"fmt"
	"log"

	"example.com/greetings"
)

func main() {
	log.SetPrefix("greetings: ")
	log.SetFlags(0)

	message, err := greetings.Hello("Eduardo")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(message)

	names := []string{"Eduardo", "Joel", "Tellus"}
	nameMap, err := greetings.Hellos(names)

	if err != nil {
		log.Fatal(err)
	}

	for from, message := range nameMap {
		fmt.Printf("From: %v, message: %v\n", from, message)
	}
	for name := range nameMap {
		if name == "Eduardo" {
			fmt.Println("Olá")
		}
	}

	fmt.Println(greetings.TestNew())
}
