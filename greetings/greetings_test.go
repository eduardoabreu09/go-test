package greetings

import (
	"regexp"
	"strings"
	"testing"
)

func TestHelloEmpty(t *testing.T) {
	msg, err := Hello("")

	if msg != "" || err == nil {
		t.Errorf(`Hello("") = %q, %v, want "", error`, msg, err)
	}
}

func TestHelloName(t *testing.T) {
	name := "Eduardo"
	want := regexp.MustCompile(`\b` + name + `\b`)

	msg, err := Hello(name)
	if !want.MatchString(msg) || err != nil {
		t.Errorf(`Hello("Gladys") = %q, %v, want match for %#q, nil`, msg, err, want)
	}
}

func TestHellosEmpty(t *testing.T) {
	names := []string{}

	msgMap, err := Hellos(names)
	if len(msgMap) != 0 || err != nil {
		t.Errorf(`Map size should be 0 and has error, current: %v, %v`, len(msgMap), err)
	}
}

func TestHellosName(t *testing.T) {
	names := []string{"Eduardo", "Joel", "Tellus"}

	msgMap, err := Hellos(names)

	if len(msgMap) != len(names) || err != nil {
		t.Errorf(`Map size should be 3 and has no error, current: %v, %v`, len(msgMap), err)
	}

	for _, name := range names {
		_, ok := msgMap[name]
		if !ok {
			t.Errorf("Map should contain %v", name)
		}
	}
}

func FuzzHello(f *testing.F) {
	name := "Eduardo"
	f.Add(name)
	f.Fuzz(func(t *testing.T, orig string) {
        msg, err := Hello(orig)
		if orig == "" {
			return
		}
		if !strings.Contains(msg, orig) || err != nil {
			t.Errorf(`Hello() = %q, %v`, msg, err)
		}
    })
}
