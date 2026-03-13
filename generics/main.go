package main

import "fmt"

type Number interface {
    int8 | int16 | int32 | int64 | float32 | float64
}

func main() {
	numsInt := []int64{34, 12}
	numsFloat := []float64{35.98, 26.99}

	fmt.Printf("Non-Generic Sums: %v and %v\n",
        SumInts(numsInt),
        SumFloats(numsFloat))

	fmt.Printf("Generic Sums: %v and %v\n",
    SumNumbers(numsInt),
    SumNumbers(numsFloat))
}

func SumInts(nums []int64) int64 {
	var sum int64 = 0
	for _, num := range nums {
		sum += num
	}
	return  sum
}

func SumFloats(nums []float64) float64 {
	var sum float64 = 0
	for _, num := range nums {
		sum += num
	}
	return  sum
}

func SumNumbers[V Number](nums []V) V {
	var sum V = 0
	for _, num := range nums {
		sum += num
	}
	return  sum
}