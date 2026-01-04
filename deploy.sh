#!/bin/sh
DOCUMENT_ROOT=/var/www/sources

# Take site offline
echo "Taking site offline..."
touch $DOCUMENT_ROOT/maintenance.file

# Swap over the content
echo "Deploying content..."
mkdir -p $DOCUMENT_ROOT/Pepperbox
cp Pepperbox.ico $DOCUMENT_ROOT/Pepperbox
cp Pepperbox.json $DOCUMENT_ROOT/Pepperbox
cp Pepperbox.js $DOCUMENT_ROOT/Pepperbox
sh sign.sh $DOCUMENT_ROOT/Pepperbox/Pepperbox.js $DOCUMENT_ROOT/Pepperbox/Pepperbox.json

# Notify Cloudflare to wipe the CDN cache
echo "Purging Cloudflare cache for zone $CLOUDFLARE_ZONE_ID..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"files":["https://plugins.grayjay.app/Pepperbox/Pepperbox.ico", "https://plugins.grayjay.app/Pepperbox/PepperboxConfig.json", "https://plugins.grayjay.app/Pepperbox/PepperboxScript.js"]}'

# Take site back online
echo "Bringing site back online..."
rm $DOCUMENT_ROOT/maintenance.file
