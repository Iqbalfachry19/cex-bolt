pragma circom 2.0.0;

// Input signals: 
// - birthYear: the birth year
// - birthMonth: the birth month
// - birthDay: the birth day
// - currentYear: the current year
// - currentMonth: the current month
// - currentDay: the current day
// - minAge: the minimum age required

// Output signals:
// - isOldEnough: 1 if the person is at least minAge years old, 0 otherwise

template DateComparison() {
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    signal input minAge;
    signal output isOldEnough;

    // Calculate age in years
    signal ageInYears;
    ageInYears <== currentYear - birthYear;

    // Adjust for month/day not reached yet
    signal monthComparison;
    monthComparison <== currentMonth - birthMonth;
    
    signal dayComparison; 
    dayComparison <== currentDay - birthDay;

    // Adjust age if birthday hasn't occurred yet this year
    signal monthLess;
    monthLess <== (monthComparison < 0) ? 1 : 0;
    
    signal monthSameButDayLess;
    monthSameButDayLess <== (monthComparison == 0 && dayComparison < 0) ? 1 : 0;
    
    signal adjustAge;
    adjustAge <== monthLess + monthSameButDayLess;
    
    signal adjustedAge;
    adjustedAge <== ageInYears - adjustAge;
    
    // Final check if age is sufficient
    isOldEnough <== adjustedAge >= minAge ? 1 : 0;
}

component main = DateComparison();