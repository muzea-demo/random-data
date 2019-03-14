假装自己有个 CFG

```bnf
template        = *[statement 1*breakLine]
breakLine       = "\n"
statement       = constraint | repeat
constraint      = intConstraint | setConstraint | graphConstraint
intConstraint   = "constraint" ws varName ws "int" ws exp ws exp [ flagPart ]
setConstraint   = "constraint" ws varName ws "set" ws setValues [ flagPart ]
setValues       = stringValue [ ws setValues ]
graphConstraint = "constraint" ws varName ws "graph" ws graphNum ws nodeNum ws edgeNum [ flagPart ]
flagPart        = *ws "|" *ws flags
flags           = normalFlag|functionFlag 1*ws [ flags ]
normalFlag      = "shuffle" | "directed"
functionFlag    = linkFlag | unlinkFlag
linkFlag        = "link(" varName "," varName ")"
unlinkFlag      = "unlink(" varName "," varName ")"
graphNum        = exp
nodeNum         = exp
edgeNum         = exp
repeat          = repeatLine | repeatGroup
repeatLine      = "repeat" ws exp ws repeatContent
repeatGroup     = "repeat group" ws exp breakLine *[ repeatLine breakLine ] "end group"
repeatContent   = (utf8char - "$") | ( "${" varName "}" ) *repeatContent
exp             = js_Expression
varName         = stringValue
number          = 1*digit
digit           = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
stringValue     = 1*(utf8char - "-" - "+" - "*")
ws              = " "
```
