假装自己有个 CFG

```bnf
template        = *[statement 1*breakLine]
breakLine       = "\n"
statement       = constraint | repeat
constraint      = intConstraint | setConstraint | graphConstraint
intConstraint   = "constraint" ws varName ws "int" ws varOrNumber ws varOrNumber [ flagPart ]
setConstraint   = "constraint" ws varName ws "set" ws setValues [ flagPart ]
setValues       = stringValue [ ws setValues ]
graphConstraint = "constraint" ws varName ws "graph" ws graphNum ws nodeNum ws edgeNum [ flagPart ]
flagPart        = *ws "|" *ws flags
flags           = stringValue 1*ws [ flags ]
graphNum        = varOrNumber
nodeNum         = varOrNumber
edgeNum         = varOrNumber
repeat          = repeatLine | repeatGroup
repeatLine      = "repeat" ws varOrNumber ws repeatContent
repeatGroup     = "repeat group" ws varOrNumber breakLine *[ repeatLine breakLine ] "end group"
repeatContent   = (utf8char - "$") | ( "${" varName "}" ) *repeatContent
varOrNumber     = varName|number|exp
exp             = varName|number opt varName|number
opt             = "+" | "-" | "*"
varName         = stringValue
number          = 1*digit
digit           = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
stringValue     = 1*(utf8char - "-" - "+" - "*")
ws              = " "
```
