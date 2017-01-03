
IP="192.168.1.82"
PORT=42069

CURRENT_PART=START

while [ true ]; do
    
    SERVER_RESPONSE=$(echo "GET/$CURRENT_PART" | nc $IP $PORT)
    
    STORY=${SERVER_RESPONSE%/*}
    ANSWERS=${SERVER_RESPONSE#*/}
    
    AMOUNT_OF_ANSWERS=$(echo $ANSWERS | tr '&' '\n' | wc -l | tr -d ' ')

    clear
    echo -e "\t\t $STORY ($CURRENT_PART)"
    echo ""
    for i in $(seq 1 $AMOUNT_OF_ANSWERS); do
        ANSWER=$(echo $ANSWERS | cut -d \& -f $i)
        echo "$i: ${ANSWER%>*}"
    done

    echo -n "> "
    RESP=""
    read RESP
    if [[ RESP -eq "" ]]; then
        break
    fi
    ANSWER=$(echo $ANSWERS | cut -d \& -f $RESP)

    if [[ $ANSWER == "" ]]; then
        echo "Not in range."
        continue
    fi
    CURRENT_PART=${ANSWER#*>}
done